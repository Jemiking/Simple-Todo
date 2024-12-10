import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { format } from 'date-fns';
import { Todo } from '../types/todo';

export interface BackupData {
  version: string;
  timestamp: string;
  todos: Todo[];
  categories: any[];
  tags: any[];
}

export class BackupService {
  private static readonly BACKUP_FOLDER = `${FileSystem.documentDirectory}backups/`;
  private static readonly BACKUP_PREFIX = 'todo_backup_';
  private static readonly CURRENT_VERSION = '1.0.0';

  // 初始化备份目录
  static async initialize(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.BACKUP_FOLDER);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.BACKUP_FOLDER, {
          intermediates: true,
        });
      }
    } catch (error) {
      console.error('Error initializing backup folder:', error);
      throw error;
    }
  }

  // 创建备份
  static async createBackup(): Promise<string> {
    try {
      // 获取所有数据
      const [todos, categories, tags] = await Promise.all([
        AsyncStorage.getItem('@SimpleTodo:todos'),
        AsyncStorage.getItem('@SimpleTodo:categories'),
        AsyncStorage.getItem('@SimpleTodo:tags'),
      ]);

      // 准备备份数据
      const backupData: BackupData = {
        version: this.CURRENT_VERSION,
        timestamp: new Date().toISOString(),
        todos: todos ? JSON.parse(todos) : [],
        categories: categories ? JSON.parse(categories) : [],
        tags: tags ? JSON.parse(tags) : [],
      };

      // 生成备份文件名
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const backupFileName = `${this.BACKUP_PREFIX}${timestamp}.json`;
      const backupPath = `${this.BACKUP_FOLDER}${backupFileName}`;

      // 写入备份文件
      await FileSystem.writeAsStringAsync(
        backupPath,
        JSON.stringify(backupData, null, 2),
        {
          encoding: FileSystem.EncodingType.UTF8,
        }
      );

      return backupPath;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  // 恢复备份
  static async restoreBackup(backupPath: string): Promise<void> {
    try {
      // 读取备份文件
      const backupContent = await FileSystem.readAsStringAsync(backupPath, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 解析备份数��
      const backupData: BackupData = JSON.parse(backupContent);

      // 验证版本兼容性
      if (backupData.version !== this.CURRENT_VERSION) {
        throw new Error('Backup version is not compatible');
      }

      // 恢复数据
      await Promise.all([
        AsyncStorage.setItem('@SimpleTodo:todos', JSON.stringify(backupData.todos)),
        AsyncStorage.setItem('@SimpleTodo:categories', JSON.stringify(backupData.categories)),
        AsyncStorage.setItem('@SimpleTodo:tags', JSON.stringify(backupData.tags)),
      ]);
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  }

  // 获取备份列表
  static async getBackupList(): Promise<{ name: string; path: string; timestamp: Date }[]> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.BACKUP_FOLDER);
      const backupFiles = files.filter(file => file.startsWith(this.BACKUP_PREFIX));

      const backupList = await Promise.all(
        backupFiles.map(async file => {
          const path = `${this.BACKUP_FOLDER}${file}`;
          const content = await FileSystem.readAsStringAsync(path, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          const data: BackupData = JSON.parse(content);
          return {
            name: file,
            path,
            timestamp: new Date(data.timestamp),
          };
        })
      );

      // 按时间倒序排序
      return backupList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Error getting backup list:', error);
      throw error;
    }
  }

  // 删除备份
  static async deleteBackup(backupPath: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(backupPath);
    } catch (error) {
      console.error('Error deleting backup:', error);
      throw error;
    }
  }

  // 清理旧备份（保留最近30天的备份）
  static async cleanupOldBackups(): Promise<void> {
    try {
      const backupList = await this.getBackupList();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const oldBackups = backupList.filter(
        backup => backup.timestamp < thirtyDaysAgo
      );

      await Promise.all(
        oldBackups.map(backup => this.deleteBackup(backup.path))
      );
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
      throw error;
    }
  }

  // 导出备份
  static async exportBackup(backupPath: string): Promise<void> {
    try {
      const exportPath = `${FileSystem.documentDirectory}${format(new Date(), 'yyyyMMdd_HHmmss')}_todo_backup.json`;
      await FileSystem.copyAsync({
        from: backupPath,
        to: exportPath,
      });
    } catch (error) {
      console.error('Error exporting backup:', error);
      throw error;
    }
  }

  // 导入备份
  static async importBackup(importPath: string): Promise<void> {
    try {
      // 验证文件格式
      const content = await FileSystem.readAsStringAsync(importPath, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const data = JSON.parse(content);

      if (!data.version || !data.timestamp || !data.todos) {
        throw new Error('Invalid backup file format');
      }

      // 复制到备份目录
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const backupFileName = `${this.BACKUP_PREFIX}${timestamp}.json`;
      const backupPath = `${this.BACKUP_FOLDER}${backupFileName}`;

      await FileSystem.copyAsync({
        from: importPath,
        to: backupPath,
      });

      // 恢复数据
      await this.restoreBackup(backupPath);
    } catch (error) {
      console.error('Error importing backup:', error);
      throw error;
    }
  }
} 