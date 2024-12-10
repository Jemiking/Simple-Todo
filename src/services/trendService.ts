import { Todo } from '../types/todo';
import { format, startOfDay, endOfDay, eachDayOfInterval, subDays } from 'date-fns';

export interface TrendData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

export interface TrendOptions {
  days: number;
  includeCompleted?: boolean;
  includeOverdue?: boolean;
  includeCreated?: boolean;
  includeUpdated?: boolean;
  groupBy?: 'day' | 'week' | 'month';
}

export class TrendService {
  // 获取趋势数据
  static getTrendData(todos: Todo[], options: TrendOptions): TrendData {
    const now = new Date();
    const startDate = subDays(now, options.days);
    const dates = eachDayOfInterval({ start: startDate, end: now });

    // 准备数据集
    const datasets: TrendData['datasets'] = [];

    // 已完成趋势
    if (options.includeCompleted) {
      const completedData = dates.map(date => {
        const start = startOfDay(date);
        const end = endOfDay(date);
        return todos.filter(todo =>
          todo.completed &&
          todo.updatedAt >= start &&
          todo.updatedAt <= end
        ).length;
      });

      datasets.push({
        label: '已完成',
        data: completedData,
        color: '#4CAF50',
      });
    }

    // 逾期趋势
    if (options.includeOverdue) {
      const overdueData = dates.map(date => {
        const start = startOfDay(date);
        const end = endOfDay(date);
        return todos.filter(todo =>
          !todo.completed &&
          todo.dueDate &&
          todo.dueDate >= start &&
          todo.dueDate <= end
        ).length;
      });

      datasets.push({
        label: '已逾期',
        data: overdueData,
        color: '#F44336',
      });
    }

    // 新建趋势
    if (options.includeCreated) {
      const createdData = dates.map(date => {
        const start = startOfDay(date);
        const end = endOfDay(date);
        return todos.filter(todo =>
          todo.createdAt >= start &&
          todo.createdAt <= end
        ).length;
      });

      datasets.push({
        label: '新建',
        data: createdData,
        color: '#2196F3',
      });
    }

    // 更新趋势
    if (options.includeUpdated) {
      const updatedData = dates.map(date => {
        const start = startOfDay(date);
        const end = endOfDay(date);
        return todos.filter(todo =>
          todo.updatedAt >= start &&
          todo.updatedAt <= end
        ).length;
      });

      datasets.push({
        label: '更新',
        data: updatedData,
        color: '#9C27B0',
      });
    }

    return {
      labels: dates.map(date => format(date, 'MM-dd')),
      datasets,
    };
  }

  // 获取完成率趋势
  static getCompletionRateTrend(todos: Todo[], options: TrendOptions): TrendData {
    const now = new Date();
    const startDate = subDays(now, options.days);
    const dates = eachDayOfInterval({ start: startDate, end: now });

    const completionRateData = dates.map(date => {
      const start = startOfDay(date);
      const end = endOfDay(date);
      const todosInRange = todos.filter(todo =>
        todo.dueDate &&
        todo.dueDate >= start &&
        todo.dueDate <= end
      );
      const completedTodos = todosInRange.filter(todo => todo.completed);
      return todosInRange.length > 0
        ? (completedTodos.length / todosInRange.length) * 100
        : 0;
    });

    return {
      labels: dates.map(date => format(date, 'MM-dd')),
      datasets: [
        {
          label: '完成率',
          data: completionRateData,
          color: '#2196F3',
        },
      ],
    };
  }

  // 获取效率趋势
  static getEfficiencyTrend(todos: Todo[], options: TrendOptions): TrendData {
    const now = new Date();
    const startDate = subDays(now, options.days);
    const dates = eachDayOfInterval({ start: startDate, end: now });

    const efficiencyData = dates.map(date => {
      const start = startOfDay(date);
      const end = endOfDay(date);
      const completedTodos = todos.filter(todo =>
        todo.completed &&
        todo.updatedAt >= start &&
        todo.updatedAt <= end
      );
      const totalTime = completedTodos.reduce((sum, todo) => {
        const completionTime = todo.updatedAt.getTime() - todo.createdAt.getTime();
        return sum + completionTime;
      }, 0);
      return completedTodos.length > 0
        ? totalTime / completedTodos.length / (1000 * 60 * 60) // 转换为小时
        : 0;
    });

    return {
      labels: dates.map(date => format(date, 'MM-dd')),
      datasets: [
        {
          label: '平均完成时间（小时）',
          data: efficiencyData,
          color: '#FF9800',
        },
      ],
    };
  }

  // 获取分类趋势
  static getCategoryTrend(todos: Todo[], options: TrendOptions): TrendData {
    const now = new Date();
    const startDate = subDays(now, options.days);
    const dates = eachDayOfInterval({ start: startDate, end: now });

    // 获取所有分类
    const categories = new Set(todos.map(todo => todo.categoryId).filter(Boolean));

    // 为每个分类创建数据集
    const datasets = Array.from(categories).map(categoryId => {
      const categoryTodos = todos.filter(todo => todo.categoryId === categoryId);
      const data = dates.map(date => {
        const start = startOfDay(date);
        const end = endOfDay(date);
        return categoryTodos.filter(todo =>
          todo.completed &&
          todo.updatedAt >= start &&
          todo.updatedAt <= end
        ).length;
      });

      return {
        label: `分类 ${categoryId}`,
        data,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // 随机颜色
      };
    });

    return {
      labels: dates.map(date => format(date, 'MM-dd')),
      datasets,
    };
  }

  // 获取标签趋势
  static getTagTrend(todos: Todo[], options: TrendOptions): TrendData {
    const now = new Date();
    const startDate = subDays(now, options.days);
    const dates = eachDayOfInterval({ start: startDate, end: now });

    // 获取所有标签
    const tags = new Set(todos.flatMap(todo => todo.tagIds));

    // 为每个标签创建数据集
    const datasets = Array.from(tags).map(tagId => {
      const tagTodos = todos.filter(todo => todo.tagIds.includes(tagId));
      const data = dates.map(date => {
        const start = startOfDay(date);
        const end = endOfDay(date);
        return tagTodos.filter(todo =>
          todo.completed &&
          todo.updatedAt >= start &&
          todo.updatedAt <= end
        ).length;
      });

      return {
        label: `标签 ${tagId}`,
        data,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // 随机颜色
      };
    });

    return {
      labels: dates.map(date => format(date, 'MM-dd')),
      datasets,
    };
  }
} 