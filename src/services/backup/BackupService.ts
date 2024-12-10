import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { format } from 'date-fns';
import { Todo } from '../../types/todo';

const BACKUP_CONFIG_KEY = '@backup_config';
const BACKUP_DIR = `${FileSystem.documentDirectory}backups/`;

export interface BackupConfig {
  enabled: boolean;
  interval: number; // 备份间隔（小时）
  maxBackups: number; // 最大保留备份数量
  lastBackupTime?: Date;
}

export class BackupService {
  private static instance: BackupService;
  private config: BackupConfig = {
    enabled: false,
    interval: 24, // 默认24小时
    maxBackups: 7, // 默认保留7个备份
  };
  private backupTimer?: NodeJS.Timeout;

  private constructor() {}

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  async initialize(config?: Partial<BackupConfig>): Promise<void> {
    try {
      // 加载保存的配置
      const savedConfig = await this.loadConfig();
      this.config = { ...this.config, ...savedConfig, ...config };

      // 确保备份目录存在
      await this.ensureBackupDir();

      // 如果启用了自动备份，开始定时任务
      if (this.config.enabled) {
        this.startAutoBackup();
      }
    } catch (error) {
      console.error('初始化备份服务失败:', error);
      throw error;
    }
  }

  private async loadConfig(): Promise<Partial<BackupConfig>> {
    try {
      const configStr = await AsyncStorage.getItem(BACKUP_CONFIG_KEY);
      if (configStr) {
        const config = JSON.parse(configStr);
        if (config.lastBackupTime) {
          config.lastBackupTime = new Date(config.lastBackupTime);
        }
        return config;
      }
      return {};
    } catch (error) {
      console.error('加载备份配置失败:', error);
      return {};
    }
  }

  async saveConfig(config: Partial<BackupConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...config };
      await AsyncStorage.setItem(BACKUP_CONFIG_KEY, JSON.stringify(this.config));

      // 根据新配置更新定时任务
      if (this.config.enabled) {
        this.startAutoBackup();
      } else {
        this.stopAutoBackup();
      }
    } catch (error) {
      console.error('保存备份配置失败:', error);
      throw error;
    }
  }

  private async ensureBackupDir(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('创建备份目录失败:', error);
      throw error;
    }
  }

  private startAutoBackup(): void {
    // 清除现有的定时器
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
    }

    // 设置新的定时器
    const interval = this.config.interval * 60 * 60 * 1000; // 转换为毫秒
    this.backupTimer = setInterval(async () => {
      try {
        await this.createBackup();
      } catch (error) {
        console.error('自动备份失败:', error);
      }
    }, interval);

    // 如果从未备份或距离上次备份时间超过间隔，立即执行一次备份
    const lastBackup = this.config.lastBackupTime;
    if (!lastBackup || Date.now() - lastBackup.getTime() >= interval) {
      this.createBackup().catch(error => {
        console.error('初始备份失败:', error);
      });
    }
  }

  private stopAutoBackup(): void {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
      this.backupTimer = undefined;
    }
  }

  async createBackup(): Promise<string> {
    try {
      // 获取所有Todo数据
      const todosStr = await AsyncStorage.getItem('@todos');
      if (!todosStr) {
        throw new Error('没有找到Todo数据');
      }

      // 生成备份文件名
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const backupPath = `${BACKUP_DIR}backup_${timestamp}.json`;

      // 写入备份文件
      await FileSystem.writeAsStringAsync(backupPath, todosStr, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 更新最后备份时间
      this.config.lastBackupTime = new Date();
      await this.saveConfig(this.config);

      // 清理旧备份
      await this.cleanOldBackups();

      return backupPath;
    } catch (error) {
      console.error('创建备份失败:', error);
      throw error;
    }
  }

  async restoreFromBackup(backupPath: string): Promise<void> {
    try {
      // 读取备份文件
      const content = await FileSystem.readAsStringAsync(backupPath, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 验证数据格式
      const todos = JSON.parse(content) as Todo[];
      if (!Array.isArray(todos)) {
        throw new Error('无效的备份数据格式');
      }

      // 恢复数据
      await AsyncStorage.setItem('@todos', content);
    } catch (error) {
      console.error('恢复备份失败:', error);
      throw error;
    }
  }

  async listBackups(): Promise<{ path: string; date: Date }[]> {
    try {
      const files = await FileSystem.readDirectoryAsync(BACKUP_DIR);
      return files
        .filter(file => file.startsWith('backup_') && file.endsWith('.json'))
        .map(file => ({
          path: `${BACKUP_DIR}${file}`,
          date: this.parseBackupDate(file),
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error('列出备份失败:', error);
      throw error;
    }
  }

  private parseBackupDate(filename: string): Date {
    const dateStr = filename.replace('backup_', '').replace('.json', '');
    const year = parseInt(dateStr.slice(0, 4));
    const month = parseInt(dateStr.slice(4, 6)) - 1;
    const day = parseInt(dateStr.slice(6, 8));
    const hour = parseInt(dateStr.slice(9, 11));
    const minute = parseInt(dateStr.slice(11, 13));
    const second = parseInt(dateStr.slice(13, 15));
    return new Date(year, month, day, hour, minute, second);
  }

  private async cleanOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();
      if (backups.length > this.config.maxBackups) {
        const toDelete = backups.slice(this.config.maxBackups);
        await Promise.all(
          toDelete.map(backup => FileSystem.deleteAsync(backup.path))
        );
      }
    } catch (error) {
      console.error('清理旧备份失败:', error);
    }
  }

  getConfig(): BackupConfig {
    return { ...this.config };
  }
} 