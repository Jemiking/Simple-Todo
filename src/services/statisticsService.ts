import { Todo, TodoPriority } from '../types/todo';

export interface TodoStatistics {
  total: number;
  completed: number;
  incomplete: number;
  completionRate: number;
  overdue: number;
  overdueRate: number;
  byPriority: {
    [key in TodoPriority]: {
      total: number;
      completed: number;
      incomplete: number;
      completionRate: number;
    };
  };
  byCategory: {
    [key: string]: {
      total: number;
      completed: number;
      incomplete: number;
      completionRate: number;
    };
  };
  byTag: {
    [key: string]: {
      total: number;
      completed: number;
      incomplete: number;
      completionRate: number;
    };
  };
  byDate: {
    [key: string]: {
      total: number;
      completed: number;
      incomplete: number;
      completionRate: number;
    };
  };
}

export class StatisticsService {
  // 计算统计数据
  static calculateStatistics(todos: Todo[]): TodoStatistics {
    const now = new Date();
    const statistics: TodoStatistics = {
      total: todos.length,
      completed: 0,
      incomplete: 0,
      completionRate: 0,
      overdue: 0,
      overdueRate: 0,
      byPriority: {
        [TodoPriority.High]: { total: 0, completed: 0, incomplete: 0, completionRate: 0 },
        [TodoPriority.Medium]: { total: 0, completed: 0, incomplete: 0, completionRate: 0 },
        [TodoPriority.Low]: { total: 0, completed: 0, incomplete: 0, completionRate: 0 },
      },
      byCategory: {},
      byTag: {},
      byDate: {},
    };

    // 遍历所有Todo项
    todos.forEach(todo => {
      // 更新完成状态统计
      if (todo.completed) {
        statistics.completed++;
      } else {
        statistics.incomplete++;
        // 检查是否逾期
        if (todo.dueDate && todo.dueDate < now) {
          statistics.overdue++;
        }
      }

      // 更新优先级统计
      if (todo.priority) {
        const priorityStats = statistics.byPriority[todo.priority];
        priorityStats.total++;
        if (todo.completed) {
          priorityStats.completed++;
        } else {
          priorityStats.incomplete++;
        }
      }

      // 更新分类统计
      if (todo.categoryId) {
        if (!statistics.byCategory[todo.categoryId]) {
          statistics.byCategory[todo.categoryId] = {
            total: 0,
            completed: 0,
            incomplete: 0,
            completionRate: 0,
          };
        }
        const categoryStats = statistics.byCategory[todo.categoryId];
        categoryStats.total++;
        if (todo.completed) {
          categoryStats.completed++;
        } else {
          categoryStats.incomplete++;
        }
      }

      // 更新标签统计
      todo.tagIds.forEach(tagId => {
        if (!statistics.byTag[tagId]) {
          statistics.byTag[tagId] = {
            total: 0,
            completed: 0,
            incomplete: 0,
            completionRate: 0,
          };
        }
        const tagStats = statistics.byTag[tagId];
        tagStats.total++;
        if (todo.completed) {
          tagStats.completed++;
        } else {
          tagStats.incomplete++;
        }
      });

      // 更新日期统计
      if (todo.dueDate) {
        const dateKey = todo.dueDate.toISOString().split('T')[0];
        if (!statistics.byDate[dateKey]) {
          statistics.byDate[dateKey] = {
            total: 0,
            completed: 0,
            incomplete: 0,
            completionRate: 0,
          };
        }
        const dateStats = statistics.byDate[dateKey];
        dateStats.total++;
        if (todo.completed) {
          dateStats.completed++;
        } else {
          dateStats.incomplete++;
        }
      }
    });

    // 计算完成率
    statistics.completionRate = statistics.total > 0
      ? (statistics.completed / statistics.total) * 100
      : 0;

    // 计算逾期率
    statistics.overdueRate = statistics.incomplete > 0
      ? (statistics.overdue / statistics.incomplete) * 100
      : 0;

    // 计算各优先级的完成率
    Object.values(statistics.byPriority).forEach(stats => {
      stats.completionRate = stats.total > 0
        ? (stats.completed / stats.total) * 100
        : 0;
    });

    // 计算各分类的完成率
    Object.values(statistics.byCategory).forEach(stats => {
      stats.completionRate = stats.total > 0
        ? (stats.completed / stats.total) * 100
        : 0;
    });

    // 计算各标签的完成率
    Object.values(statistics.byTag).forEach(stats => {
      stats.completionRate = stats.total > 0
        ? (stats.completed / stats.total) * 100
        : 0;
    });

    // 计算各日期的完成率
    Object.values(statistics.byDate).forEach(stats => {
      stats.completionRate = stats.total > 0
        ? (stats.completed / stats.total) * 100
        : 0;
    });

    return statistics;
  }
} 