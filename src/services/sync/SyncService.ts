import { Todo } from '../../types/todo';

export interface SyncConfig {
  enabled: boolean;
  provider: 'firebase' | 'webdav';
  lastSyncTime?: Date;
}

export interface SyncProvider {
  initialize(): Promise<void>;
  uploadTodos(todos: Todo[]): Promise<void>;
  downloadTodos(): Promise<Todo[]>;
  getLastSyncTime(): Promise<Date | undefined>;
  setLastSyncTime(time: Date): Promise<void>;
}

export abstract class BaseSyncProvider implements SyncProvider {
  protected config: SyncConfig;

  constructor(config: SyncConfig) {
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  abstract uploadTodos(todos: Todo[]): Promise<void>;
  abstract downloadTodos(): Promise<Todo[]>;

  async getLastSyncTime(): Promise<Date | undefined> {
    return this.config.lastSyncTime;
  }

  async setLastSyncTime(time: Date): Promise<void> {
    this.config.lastSyncTime = time;
  }
}

export class SyncService {
  private static instance: SyncService;
  private provider?: SyncProvider;
  private config: SyncConfig = {
    enabled: false,
    provider: 'firebase',
  };

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  async initialize(config: SyncConfig): Promise<void> {
    this.config = config;
    if (config.enabled) {
      const Provider = await this.loadProvider(config.provider);
      this.provider = new Provider(config);
      await this.provider.initialize();
    }
  }

  private async loadProvider(providerName: 'firebase' | 'webdav') {
    switch (providerName) {
      case 'firebase':
        const { FirebaseSyncProvider } = await import('./FirebaseSyncProvider');
        return FirebaseSyncProvider;
      case 'webdav':
        const { WebDAVSyncProvider } = await import('./WebDAVSyncProvider');
        return WebDAVSyncProvider;
      default:
        throw new Error(`不支持的同步提供者: ${providerName}`);
    }
  }

  async sync(todos: Todo[]): Promise<Todo[]> {
    if (!this.config.enabled || !this.provider) {
      throw new Error('同步服务未启用或未初始化');
    }

    try {
      // 上传本地更改
      await this.provider.uploadTodos(todos);

      // 下载远程更改
      const remoteTodos = await this.provider.downloadTodos();

      // 更新最后同步时间
      await this.provider.setLastSyncTime(new Date());

      return remoteTodos;
    } catch (error) {
      console.error('同步失败:', error);
      throw error;
    }
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getProvider(): string {
    return this.config.provider;
  }

  async getLastSyncTime(): Promise<Date | undefined> {
    if (!this.provider) {
      return undefined;
    }
    return this.provider.getLastSyncTime();
  }
} 