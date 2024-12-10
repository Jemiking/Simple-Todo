import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from '../types/todo';

const VERSION_HISTORY_KEY = '@version_history';
const VERSION_CONFIG_KEY = '@version_config';

export interface Version {
  id: string;
  timestamp: Date;
  description: string;
  changes: VersionChange[];
  snapshot: Todo[];
}

export interface VersionChange {
  type: 'create' | 'update' | 'delete';
  todoId: string;
  before?: Todo;
  after?: Todo;
}

export interface VersionConfig {
  enabled: boolean;
  maxVersions: number;
  retentionDays: number;
  autoCleanup: boolean;
}

export const defaultVersionConfig: VersionConfig = {
  enabled: true,
  maxVersions: 50,
  retentionDays: 30,
  autoCleanup: true,
};

export class VersionHistoryService {
  private static instance: VersionHistoryService;
  private versions: Version[] = [];
  private config: VersionConfig = defaultVersionConfig;

  private constructor() {}

  static getInstance(): VersionHistoryService {
    if (!VersionHistoryService.instance) {
      VersionHistoryService.instance = new VersionHistoryService();
    }
    return VersionHistoryService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // 加载配置
      const savedConfig = await AsyncStorage.getItem(VERSION_CONFIG_KEY);
      if (savedConfig) {
        this.config = { ...defaultVersionConfig, ...JSON.parse(savedConfig) };
      }

      // 加载版本历史
      const savedVersions = await AsyncStorage.getItem(VERSION_HISTORY_KEY);
      if (savedVersions) {
        this.versions = JSON.parse(savedVersions).map((version: any) => ({
          ...version,
          timestamp: new Date(version.timestamp),
        }));
      }

      // 如果启用了自动清理，执行清理
      if (this.config.enabled && this.config.autoCleanup) {
        await this.cleanup();
      }
    } catch (error) {
      console.error('初始化版本历史服务失败:', error);
      throw error;
    }
  }

  async saveVersions(): Promise<void> {
    try {
      await AsyncStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(this.versions));
    } catch (error) {
      console.error('保存版本历史失败:', error);
      throw error;
    }
  }

  async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem(VERSION_CONFIG_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('保存版本配置失败:', error);
      throw error;
    }
  }

  getConfig(): VersionConfig {
    return { ...this.config };
  }

  async updateConfig(config: Partial<VersionConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    await this.saveConfig();

    if (this.config.enabled && this.config.autoCleanup) {
      await this.cleanup();
    }
  }

  async createVersion(description: string, changes: VersionChange[], todos: Todo[]): Promise<void> {
    if (!this.config.enabled) return;

    const version: Version = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      description,
      changes,
      snapshot: todos,
    };

    this.versions.unshift(version);
    await this.saveVersions();
    await this.cleanup();
  }

  getVersions(): Version[] {
    return [...this.versions];
  }

  getVersion(versionId: string): Version | undefined {
    return this.versions.find(v => v.id === versionId);
  }

  async deleteVersion(versionId: string): Promise<void> {
    this.versions = this.versions.filter(v => v.id !== versionId);
    await this.saveVersions();
  }

  async cleanup(): Promise<void> {
    if (!this.config.enabled) return;

    const now = new Date();
    const cutoffDate = new Date(now.getTime() - this.config.retentionDays * 24 * 60 * 60 * 1000);

    // 按时间清理
    this.versions = this.versions.filter(v => v.timestamp > cutoffDate);

    // 按数量清理
    if (this.versions.length > this.config.maxVersions) {
      this.versions = this.versions.slice(0, this.config.maxVersions);
    }

    await this.saveVersions();
  }

  compareVersions(versionId1: string, versionId2: string): VersionDiff[] {
    const version1 = this.getVersion(versionId1);
    const version2 = this.getVersion(versionId2);

    if (!version1 || !version2) {
      throw new Error('版本不存在');
    }

    const diffs: VersionDiff[] = [];
    const todos1 = new Map(version1.snapshot.map(todo => [todo.id, todo]));
    const todos2 = new Map(version2.snapshot.map(todo => [todo.id, todo]));

    // 检查修改和删除
    for (const [id, todo1] of todos1) {
      const todo2 = todos2.get(id);
      if (!todo2) {
        diffs.push({
          type: 'delete',
          todoId: id,
          before: todo1,
        });
      } else if (JSON.stringify(todo1) !== JSON.stringify(todo2)) {
        diffs.push({
          type: 'update',
          todoId: id,
          before: todo1,
          after: todo2,
        });
      }
    }

    // 检查新增
    for (const [id, todo2] of todos2) {
      if (!todos1.has(id)) {
        diffs.push({
          type: 'create',
          todoId: id,
          after: todo2,
        });
      }
    }

    return diffs;
  }

  async rollbackToVersion(versionId: string): Promise<Todo[]> {
    const version = this.getVersion(versionId);
    if (!version) {
      throw new Error('版本不存在');
    }

    return version.snapshot;
  }
}

export interface VersionDiff {
  type: 'create' | 'update' | 'delete';
  todoId: string;
  before?: Todo;
  after?: Todo;
} 