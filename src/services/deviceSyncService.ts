import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { Todo } from '../types/todo';

const DEVICE_ID_KEY = '@device_id';
const PAIRED_DEVICES_KEY = '@paired_devices';
const SYNC_STATE_KEY = '@sync_state';
const LAST_SYNC_TIME_KEY = '@last_sync_time';

export interface DeviceInfo {
  id: string;
  name: string;
  platform: string;
  lastSyncTime?: Date;
  isOnline?: boolean;
}

export interface SyncState {
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number; // 分钟
  conflictResolution: 'manual' | 'lastModified' | 'devicePriority';
  devicePriority?: string[]; // 设备ID优先级列表
}

export interface SyncConflict {
  itemId: string;
  localVersion: Todo;
  remoteVersion: Todo;
  deviceInfo: DeviceInfo;
}

export const defaultSyncState: SyncState = {
  enabled: false,
  autoSync: true,
  syncInterval: 30,
  conflictResolution: 'lastModified',
};

export class DeviceSyncService {
  private static instance: DeviceSyncService;
  private deviceId: string | null = null;
  private deviceInfo: DeviceInfo | null = null;
  private pairedDevices: DeviceInfo[] = [];
  private syncState: SyncState = defaultSyncState;
  private syncTimer: NodeJS.Timeout | null = null;
  private onlineDevices: Set<string> = new Set();
  private pendingChanges: Map<string, Todo> = new Map();
  private conflictCallbacks: ((conflict: SyncConflict) => Promise<Todo>)[] = [];

  private constructor() {}

  static getInstance(): DeviceSyncService {
    if (!DeviceSyncService.instance) {
      DeviceSyncService.instance = new DeviceSyncService();
    }
    return DeviceSyncService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // 初始化设备ID
      await this.initializeDeviceId();

      // 加载配对设备列表
      const savedDevices = await AsyncStorage.getItem(PAIRED_DEVICES_KEY);
      if (savedDevices) {
        this.pairedDevices = JSON.parse(savedDevices).map((device: any) => ({
          ...device,
          lastSyncTime: device.lastSyncTime ? new Date(device.lastSyncTime) : undefined,
        }));
      }

      // 加载同步状态
      const savedState = await AsyncStorage.getItem(SYNC_STATE_KEY);
      if (savedState) {
        this.syncState = { ...defaultSyncState, ...JSON.parse(savedState) };
      }

      // 如果启用了自动同步，启动同步定时器
      if (this.syncState.enabled && this.syncState.autoSync) {
        this.startAutoSync();
      }
    } catch (error) {
      console.error('初始化设备同步服务失败:', error);
      throw error;
    }
  }

  private async initializeDeviceId(): Promise<void> {
    try {
      // 尝试获取保存的设备ID
      this.deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

      if (!this.deviceId) {
        // 生成新的设备ID
        this.deviceId = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem(DEVICE_ID_KEY, this.deviceId);
      }

      // 获取设备信息
      const deviceName = await Device.getDeviceNameAsync() || Platform.OS;
      this.deviceInfo = {
        id: this.deviceId,
        name: deviceName,
        platform: Platform.OS,
        isOnline: true,
      };
    } catch (error) {
      console.error('初始化设备ID失败:', error);
      throw error;
    }
  }

  async savePairedDevices(): Promise<void> {
    try {
      await AsyncStorage.setItem(PAIRED_DEVICES_KEY, JSON.stringify(this.pairedDevices));
    } catch (error) {
      console.error('保存配对设备失败:', error);
      throw error;
    }
  }

  async saveSyncState(): Promise<void> {
    try {
      await AsyncStorage.setItem(SYNC_STATE_KEY, JSON.stringify(this.syncState));
    } catch (error) {
      console.error('保存同步状态失败:', error);
      throw error;
    }
  }

  getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  getPairedDevices(): DeviceInfo[] {
    return [...this.pairedDevices];
  }

  getSyncState(): SyncState {
    return { ...this.syncState };
  }

  async addPairedDevice(device: DeviceInfo): Promise<void> {
    if (device.id === this.deviceId) {
      throw new Error('不能与自己配对');
    }

    if (this.pairedDevices.some(d => d.id === device.id)) {
      throw new Error('设备已配对');
    }

    this.pairedDevices.push(device);
    await this.savePairedDevices();
  }

  async removePairedDevice(deviceId: string): Promise<void> {
    this.pairedDevices = this.pairedDevices.filter(d => d.id !== deviceId);
    await this.savePairedDevices();
  }

  async updateSyncState(state: Partial<SyncState>): Promise<void> {
    this.syncState = { ...this.syncState, ...state };
    await this.saveSyncState();

    if (this.syncState.enabled && this.syncState.autoSync) {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }
  }

  private startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(
      () => this.syncWithPairedDevices(),
      this.syncState.syncInterval * 60 * 1000
    );
  }

  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  async syncWithPairedDevices(): Promise<void> {
    if (!this.syncState.enabled) return;

    for (const device of this.pairedDevices) {
      if (device.isOnline) {
        try {
          await this.syncWithDevice(device);
        } catch (error) {
          console.error(`与设备 ${device.name} 同步失败:`, error);
        }
      }
    }
  }

  private async syncWithDevice(device: DeviceInfo): Promise<void> {
    // 获取本地更改
    const localChanges = Array.from(this.pendingChanges.values());

    // 获取远程更改（需要实现具体的通信逻辑）
    const remoteChanges = await this.fetchRemoteChanges(device);

    // 检测并解决冲突
    const conflicts = this.detectConflicts(localChanges, remoteChanges);
    const resolvedChanges = await this.resolveConflicts(conflicts);

    // 合并更改
    await this.mergeChanges(resolvedChanges);

    // 更新同步时间
    device.lastSyncTime = new Date();
    await this.savePairedDevices();
  }

  private async fetchRemoteChanges(device: DeviceInfo): Promise<Todo[]> {
    // TODO: 实现与远程设备的通信逻辑
    return [];
  }

  private detectConflicts(localChanges: Todo[], remoteChanges: Todo[]): SyncConflict[] {
    const conflicts: SyncConflict[] = [];

    for (const local of localChanges) {
      const remote = remoteChanges.find(r => r.id === local.id);
      if (remote && remote.updatedAt !== local.updatedAt) {
        conflicts.push({
          itemId: local.id,
          localVersion: local,
          remoteVersion: remote,
          deviceInfo: this.deviceInfo!,
        });
      }
    }

    return conflicts;
  }

  private async resolveConflicts(conflicts: SyncConflict[]): Promise<Todo[]> {
    const resolved: Todo[] = [];

    for (const conflict of conflicts) {
      let resolvedItem: Todo;

      switch (this.syncState.conflictResolution) {
        case 'lastModified':
          resolvedItem = conflict.localVersion.updatedAt > conflict.remoteVersion.updatedAt
            ? conflict.localVersion
            : conflict.remoteVersion;
          break;

        case 'devicePriority':
          if (this.syncState.devicePriority) {
            const localPriority = this.syncState.devicePriority.indexOf(this.deviceId!);
            const remotePriority = this.syncState.devicePriority.indexOf(conflict.deviceInfo.id);
            resolvedItem = localPriority >= remotePriority
              ? conflict.localVersion
              : conflict.remoteVersion;
          } else {
            resolvedItem = conflict.localVersion;
          }
          break;

        case 'manual':
          // 调用冲突回调让用户选择
          if (this.conflictCallbacks.length > 0) {
            resolvedItem = await this.conflictCallbacks[0](conflict);
          } else {
            resolvedItem = conflict.localVersion;
          }
          break;

        default:
          resolvedItem = conflict.localVersion;
      }

      resolved.push(resolvedItem);
    }

    return resolved;
  }

  private async mergeChanges(changes: Todo[]): Promise<void> {
    // TODO: 实现更改合并逻辑
  }

  addConflictCallback(callback: (conflict: SyncConflict) => Promise<Todo>): void {
    this.conflictCallbacks.push(callback);
  }

  removeConflictCallback(callback: (conflict: SyncConflict) => Promise<Todo>): void {
    const index = this.conflictCallbacks.indexOf(callback);
    if (index !== -1) {
      this.conflictCallbacks.splice(index, 1);
    }
  }

  addPendingChange(todo: Todo): void {
    this.pendingChanges.set(todo.id, todo);
  }

  removePendingChange(todoId: string): void {
    this.pendingChanges.delete(todoId);
  }

  clearPendingChanges(): void {
    this.pendingChanges.clear();
  }

  setDeviceOnline(deviceId: string, isOnline: boolean): void {
    if (isOnline) {
      this.onlineDevices.add(deviceId);
    } else {
      this.onlineDevices.delete(deviceId);
    }

    const device = this.pairedDevices.find(d => d.id === deviceId);
    if (device) {
      device.isOnline = isOnline;
    }
  }

  isDeviceOnline(deviceId: string): boolean {
    return this.onlineDevices.has(deviceId);
  }
} 