import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { format } from 'date-fns';
import { Todo } from '../types/todo';
import { BackupService } from './backupService';

export interface ExportData {
  version: string;
  timestamp: string;
  todos: Todo[];
  categories: any[];
  tags: any[];
}

export class ExportService {
  private static readonly EXPORT_FOLDER = `${FileSystem.documentDirectory}exports/`;
  private static readonly EXPORT_PREFIX = 'todo_export_';
  private static readonly CURRENT_VERSION = '1.0.0';

  // 初始化导出目录
  static async initialize(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.EXPORT_FOLDER);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.EXPORT_FOLDER, {
          intermediates: true,
        });
      }
    } catch (error) {
      console.error('Error initializing export folder:', error);
      throw error;
    }
  }

  // 导出数据为JSON文件
  static async exportToJson(): Promise<void> {
    try {
      await this.initialize();

      // 获取备份数据
      const backupPath = await BackupService.createBackup();
      const backupContent = await FileSystem.readAsStringAsync(backupPath);
      const backupData = JSON.parse(backupContent);

      // 生成导出文件名
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const exportFileName = `${this.EXPORT_PREFIX}${timestamp}.json`;
      const exportPath = `${this.EXPORT_FOLDER}${exportFileName}`;

      // 写入导出文件
      await FileSystem.writeAsStringAsync(
        exportPath,
        JSON.stringify(backupData, null, 2),
        {
          encoding: FileSystem.EncodingType.UTF8,
        }
      );

      // 分享文件
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(exportPath, {
          mimeType: 'application/json',
          dialogTitle: '导出待办事项',
          UTI: 'public.json',
        });
      }
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      throw error;
    }
  }

  // 导出数据为CSV文件
  static async exportToCsv(): Promise<void> {
    try {
      await this.initialize();

      // 获取备份数据
      const backupPath = await BackupService.createBackup();
      const backupContent = await FileSystem.readAsStringAsync(backupPath);
      const backupData = JSON.parse(backupContent);

      // 转换为CSV格式
      const headers = [
        'ID',
        '标题',
        '描述',
        '完成状态',
        '截止日期',
        '优先级',
        '分类',
        '标签',
        '创建时间',
        '更新时间',
      ].join(',');

      const rows = backupData.todos.map((todo: Todo) => [
        todo.id,
        `"${todo.title.replace(/"/g, '""')}"`,
        todo.description ? `"${todo.description.replace(/"/g, '""')}"` : '',
        todo.completed ? '是' : '否',
        todo.dueDate ? format(new Date(todo.dueDate), 'yyyy-MM-dd HH:mm:ss') : '',
        todo.priority ? ['高', '中', '低'][todo.priority - 1] : '',
        todo.categoryId || '',
        todo.tagIds.join(';'),
        format(new Date(todo.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        format(new Date(todo.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
      ].join(','));

      const csvContent = [headers, ...rows].join('\n');

      // 生成导出文件名
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const exportFileName = `${this.EXPORT_PREFIX}${timestamp}.csv`;
      const exportPath = `${this.EXPORT_FOLDER}${exportFileName}`;

      // 写入导出文件
      await FileSystem.writeAsStringAsync(
        exportPath,
        '\ufeff' + csvContent, // 添加BOM以支持中文
        {
          encoding: FileSystem.EncodingType.UTF8,
        }
      );

      // 分享文件
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(exportPath, {
          mimeType: 'text/csv',
          dialogTitle: '导出待办事项',
          UTI: 'public.comma-separated-values-text',
        });
      }
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  }

  // 导入JSON文件
  static async importFromJson(): Promise<void> {
    try {
      // 选择文件
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        // 读取文件内容
        const content = await FileSystem.readAsStringAsync(result.uri);
        const data = JSON.parse(content);

        // 验证文件格式
        if (!data.version || !data.timestamp || !data.todos) {
          throw new Error('Invalid file format');
        }

        // 导入数据
        await BackupService.importBackup(result.uri);
      }
    } catch (error) {
      console.error('Error importing from JSON:', error);
      throw error;
    }
  }

  // 导入CSV文件
  static async importFromCsv(): Promise<void> {
    try {
      // 选择文件
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        // 读取文件内容
        const content = await FileSystem.readAsStringAsync(result.uri);
        const lines = content.split('\n');

        // 解析CSV
        const headers = lines[0].split(',');
        const todos: Todo[] = lines.slice(1).map(line => {
          const values = line.split(',');
          return {
            id: values[0],
            title: values[1].replace(/^"|"$/g, '').replace(/""/g, '"'),
            description: values[2] ? values[2].replace(/^"|"$/g, '').replace(/""/g, '"') : undefined,
            completed: values[3] === '是',
            dueDate: values[4] ? new Date(values[4]) : undefined,
            priority: values[5] ? ['高', '中', '低'].indexOf(values[5]) + 1 : undefined,
            categoryId: values[6] || undefined,
            tagIds: values[7] ? values[7].split(';') : [],
            createdAt: new Date(values[8]),
            updatedAt: new Date(values[9]),
            subTasks: [],
          };
        });

        // 创建备份数据
        const backupData: ExportData = {
          version: this.CURRENT_VERSION,
          timestamp: new Date().toISOString(),
          todos,
          categories: [],
          tags: [],
        };

        // 生成临时文件
        const tempPath = `${FileSystem.cacheDirectory}temp_import.json`;
        await FileSystem.writeAsStringAsync(
          tempPath,
          JSON.stringify(backupData),
          {
            encoding: FileSystem.EncodingType.UTF8,
          }
        );

        // 导入数据
        await BackupService.importBackup(tempPath);

        // 清理临时文件
        await FileSystem.deleteAsync(tempPath);
      }
    } catch (error) {
      console.error('Error importing from CSV:', error);
      throw error;
    }
  }
} 