import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import { Todo } from '../types/todo';
import { StatisticsService } from './statisticsService';

export interface ExportFormat {
  type: 'json' | 'csv' | 'pdf';
  includeStatistics?: boolean;
  includeSubTasks?: boolean;
  includeCategories?: boolean;
  includeTags?: boolean;
}

export class ExportDataService {
  private static readonly EXPORT_FOLDER = `${FileSystem.documentDirectory}exports/`;

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

  // 导出数据
  static async exportData(
    todos: Todo[],
    format: ExportFormat,
    categories: any[] = [],
    tags: any[] = [],
  ): Promise<void> {
    try {
      await this.initialize();

      // 生成文件名
      const timestamp = format.format(new Date(), 'yyyyMMdd_HHmmss');
      const fileName = `todo_export_${timestamp}.${format.type}`;
      const filePath = `${this.EXPORT_FOLDER}${fileName}`;

      // 准备导出数据
      let content = '';
      switch (format.type) {
        case 'json':
          content = await this.generateJsonContent(todos, format, categories, tags);
          break;
        case 'csv':
          content = await this.generateCsvContent(todos, format);
          break;
        case 'pdf':
          content = await this.generatePdfContent(todos, format, categories, tags);
          break;
      }

      // 写入文件
      await FileSystem.writeAsStringAsync(filePath, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 分享文件
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: this.getMimeType(format.type),
          dialogTitle: '导出待办事项',
          UTI: this.getUTI(format.type),
        });
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // 生成JSON内容
  private static async generateJsonContent(
    todos: Todo[],
    format: ExportFormat,
    categories: any[],
    tags: any[],
  ): Promise<string> {
    const data: any = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      todos: todos.map(todo => ({
        ...todo,
        subTasks: format.includeSubTasks ? todo.subTasks : undefined,
      })),
    };

    if (format.includeCategories) {
      data.categories = categories;
    }

    if (format.includeTags) {
      data.tags = tags;
    }

    if (format.includeStatistics) {
      data.statistics = StatisticsService.calculateStatistics(todos);
    }

    return JSON.stringify(data, null, 2);
  }

  // 生成CSV内容
  private static async generateCsvContent(
    todos: Todo[],
    format: ExportFormat,
  ): Promise<string> {
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
    ];

    if (format.includeSubTasks) {
      headers.push('子任务');
    }

    const rows = todos.map(todo => [
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
      format.includeSubTasks
        ? todo.subTasks
            .map(subTask => `${subTask.title}(${subTask.completed ? '已完成' : '未完成'})`)
            .join(';')
        : '',
    ]);

    return '\ufeff' + [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // 生成PDF内容
  private static async generatePdfContent(
    todos: Todo[],
    format: ExportFormat,
    categories: any[],
    tags: any[],
  ): Promise<string> {
    // 使用HTML模板生成PDF内容
    const template = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>待办事项导出报告</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              color: #333;
            }
            h1 {
              color: #2196F3;
              border-bottom: 2px solid #2196F3;
              padding-bottom: 10px;
            }
            .section {
              margin: 20px 0;
            }
            .todo-item {
              margin: 10px 0;
              padding: 10px;
              border: 1px solid #e0e0e0;
              border-radius: 4px;
            }
            .todo-title {
              font-size: 18px;
              font-weight: bold;
              color: #212121;
            }
            .todo-description {
              color: #757575;
              margin: 5px 0;
            }
            .todo-meta {
              color: #9e9e9e;
              font-size: 12px;
            }
            .statistics {
              margin: 20px 0;
              padding: 20px;
              background: #f5f5f5;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <h1>待办事项导出报告</h1>
          <div class="section">
            <p>导出时间：${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}</p>
            <p>总计：${todos.length} 个待办事项</p>
          </div>
          ${format.includeStatistics ? this.generateStatisticsHtml(todos) : ''}
          <div class="section">
            <h2>待办事项列表</h2>
            ${todos.map(todo => this.generateTodoHtml(todo, format)).join('\n')}
          </div>
          ${format.includeCategories ? this.generateCategoriesHtml(categories) : ''}
          ${format.includeTags ? this.generateTagsHtml(tags) : ''}
        </body>
      </html>
    `;

    return template;
  }

  // 生成���计HTML
  private static generateStatisticsHtml(todos: Todo[]): string {
    const statistics = StatisticsService.calculateStatistics(todos);
    return `
      <div class="statistics">
        <h2>统计信息</h2>
        <p>完成率：${Math.round(statistics.completionRate)}%</p>
        <p>已完成：${statistics.completed} 个</p>
        <p>未完成：${statistics.incomplete} 个</p>
        <p>已逾期：${statistics.overdue} 个</p>
      </div>
    `;
  }

  // 生成Todo项HTML
  private static generateTodoHtml(todo: Todo, format: ExportFormat): string {
    return `
      <div class="todo-item">
        <div class="todo-title">${todo.title}</div>
        ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
        <div class="todo-meta">
          <p>状态：${todo.completed ? '已完成' : '未完成'}</p>
          ${todo.dueDate ? `<p>截止日期：${format(new Date(todo.dueDate), 'yyyy-MM-dd HH:mm:ss')}</p>` : ''}
          ${todo.priority ? `<p>优先级：${['高', '中', '低'][todo.priority - 1]}</p>` : ''}
          ${format.includeSubTasks && todo.subTasks.length > 0 ? this.generateSubTasksHtml(todo.subTasks) : ''}
        </div>
      </div>
    `;
  }

  // 生成子任务HTML
  private static generateSubTasksHtml(subTasks: any[]): string {
    return `
      <div class="sub-tasks">
        <p>子任务：</p>
        <ul>
          ${subTasks.map(subTask => `
            <li>${subTask.title} (${subTask.completed ? '已完成' : '未完成'})</li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  // 生成分类HTML
  private static generateCategoriesHtml(categories: any[]): string {
    return `
      <div class="section">
        <h2>分类列表</h2>
        <ul>
          ${categories.map(category => `
            <li style="color: ${category.color}">${category.name}</li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  // 生成标签HTML
  private static generateTagsHtml(tags: any[]): string {
    return `
      <div class="section">
        <h2>标签列表</h2>
        <ul>
          ${tags.map(tag => `
            <li style="color: ${tag.color}">${tag.name}</li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  // 获取MIME类型
  private static getMimeType(type: string): string {
    switch (type) {
      case 'json':
        return 'application/json';
      case 'csv':
        return 'text/csv';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'text/plain';
    }
  }

  // 获取UTI
  private static getUTI(type: string): string {
    switch (type) {
      case 'json':
        return 'public.json';
      case 'csv':
        return 'public.comma-separated-values-text';
      case 'pdf':
        return 'com.adobe.pdf';
      default:
        return 'public.plain-text';
    }
  }
} 