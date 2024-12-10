import { createClient } from 'webdav';
import { Todo } from '../../types/todo';
import { BaseSyncProvider, SyncConfig } from './SyncService';

interface WebDAVConfig extends SyncConfig {
  url: string;
  username: string;
  password: string;
}

export class WebDAVSyncProvider extends BaseSyncProvider {
  private client: any;
  private config: WebDAVConfig;
  private readonly todosPath = '/todos.json';

  constructor(config: WebDAVConfig) {
    super(config);
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      this.client = createClient(this.config.url, {
        username: this.config.username,
        password: this.config.password,
      });

      // 测试连接
      await this.client.getDirectoryContents('/');
    } catch (error) {
      console.error('初始化WebDAV失败:', error);
      throw error;
    }
  }

  async uploadTodos(todos: Todo[]): Promise<void> {
    try {
      const serializedTodos = JSON.stringify(todos.map(todo => ({
        ...todo,
        dueDate: todo.dueDate?.toISOString(),
        reminderTime: todo.reminderTime?.toISOString(),
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
      })));

      await this.client.putFileContents(this.todosPath, serializedTodos, {
        overwrite: true,
        contentLength: serializedTodos.length,
      });
    } catch (error) {
      console.error('上传到WebDAV失败:', error);
      throw error;
    }
  }

  async downloadTodos(): Promise<Todo[]> {
    try {
      // 检查文件是否存在
      const exists = await this.client.exists(this.todosPath);
      if (!exists) {
        return [];
      }

      const content = await this.client.getFileContents(this.todosPath, {
        format: 'text',
      });

      const todos = JSON.parse(content).map((todo: any) => ({
        ...todo,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        reminderTime: todo.reminderTime ? new Date(todo.reminderTime) : undefined,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
      }));

      return todos;
    } catch (error) {
      console.error('从WebDAV下载失败:', error);
      throw error;
    }
  }

  async getLastSyncTime(): Promise<Date | undefined> {
    try {
      const exists = await this.client.exists(this.todosPath);
      if (!exists) {
        return undefined;
      }

      const stat = await this.client.stat(this.todosPath);
      return new Date(stat.lastmod);
    } catch (error) {
      console.error('获取WebDAV最后同步时间失败:', error);
      return undefined;
    }
  }
} 