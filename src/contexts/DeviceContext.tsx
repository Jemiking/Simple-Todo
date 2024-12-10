import React, { createContext, useContext, useEffect, useState } from 'react';
import { DeviceSyncService, DeviceInfo, SyncState, SyncConflict } from '../services/deviceSyncService';
import { Todo } from '../types/todo';

interface DeviceContextType {
  deviceInfo: DeviceInfo | null;
  pairedDevices: DeviceInfo[];
  syncState: SyncState;
  addPairedDevice: (device: DeviceInfo) => Promise<void>;
  removePairedDevice: (deviceId: string) => Promise<void>;
  updateSyncState: (state: Partial<SyncState>) => Promise<void>;
  syncWithPairedDevices: () => Promise<void>;
  addPendingChange: (todo: Todo) => void;
  removePendingChange: (todoId: string) => void;
  isDeviceOnline: (deviceId: string) => boolean;
  onConflict: (callback: (conflict: SyncConflict) => Promise<Todo>) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
};

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [pairedDevices, setPairedDevices] = useState<DeviceInfo[]>([]);
  const [syncState, setSyncState] = useState<SyncState>({ enabled: false } as SyncState);
  const deviceService = DeviceSyncService.getInstance();

  useEffect(() => {
    const initializeDevice = async () => {
      try {
        await deviceService.initialize();
        setDeviceInfo(deviceService.getDeviceInfo());
        setPairedDevices(deviceService.getPairedDevices());
        setSyncState(deviceService.getSyncState());
      } catch (error) {
        console.error('初始化设备同步失败:', error);
      }
    };

    initializeDevice();
  }, []);

  const addPairedDevice = async (device: DeviceInfo) => {
    try {
      await deviceService.addPairedDevice(device);
      setPairedDevices(deviceService.getPairedDevices());
    } catch (error) {
      console.error('添加配对设备失败:', error);
      throw error;
    }
  };

  const removePairedDevice = async (deviceId: string) => {
    try {
      await deviceService.removePairedDevice(deviceId);
      setPairedDevices(deviceService.getPairedDevices());
    } catch (error) {
      console.error('移除配对设备失败:', error);
      throw error;
    }
  };

  const updateSyncState = async (state: Partial<SyncState>) => {
    try {
      await deviceService.updateSyncState(state);
      setSyncState(deviceService.getSyncState());
    } catch (error) {
      console.error('更新同步状态失败:', error);
      throw error;
    }
  };

  const syncWithPairedDevices = async () => {
    try {
      await deviceService.syncWithPairedDevices();
      setPairedDevices(deviceService.getPairedDevices());
    } catch (error) {
      console.error('同步失败:', error);
      throw error;
    }
  };

  const addPendingChange = (todo: Todo) => {
    deviceService.addPendingChange(todo);
  };

  const removePendingChange = (todoId: string) => {
    deviceService.removePendingChange(todoId);
  };

  const isDeviceOnline = (deviceId: string) => {
    return deviceService.isDeviceOnline(deviceId);
  };

  const onConflict = (callback: (conflict: SyncConflict) => Promise<Todo>) => {
    deviceService.addConflictCallback(callback);
    return () => deviceService.removeConflictCallback(callback);
  };

  const value: DeviceContextType = {
    deviceInfo,
    pairedDevices,
    syncState,
    addPairedDevice,
    removePairedDevice,
    updateSyncState,
    syncWithPairedDevices,
    addPendingChange,
    removePendingChange,
    isDeviceOnline,
    onConflict,
  };

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}; 