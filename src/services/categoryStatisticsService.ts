import { Todo } from '../types/todo';
import { Category } from '../types/todo';

export interface CategoryStatistics {
  categoryId: string;
  categoryName: string;
  totalTodos: number;
  completedTodos: number;
  incompleteTodos: number;
  completionRate: number;
  overdueTodos: number;
  overdueRate: number;
  averageCompletionTime: number; // 单位：小时
  todosByPriority: {
    high: number;
    medium: number;
    low: number;
    none: number;
  };
  todosByTimeRange: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    older: number;
  };
}

export class CategoryStatisticsService {
  private static instance: CategoryStatisticsService;

  private constructor() {}

  static getInstance(): CategoryStatisticsService {
    if (!CategoryStatisticsService.instance) {
      CategoryStatisticsService.instance = new CategoryStatisticsService();
    }
    return CategoryStatisticsService.instance;
  }

  calculateStatistics(todos: Todo[], categories: Category[]): CategoryStatistics[] {
    return categories.map(category => this.calculateCategoryStatistics(todos, category));
  }

  private calculateCategoryStatistics(todos: Todo[], category: Category): CategoryStatistics {
    const categoryTodos = todos.filter(todo => todo.categoryId === category.id);
    const completedTodos = categoryTodos.filter(todo => todo.completed);
    const incompleteTodos = categoryTodos.filter(todo => !todo.completed);
    const now = new Date();

    // 计算逾期任务
    const overdueTodos = incompleteTodos.filter(todo => 
      todo.dueDate && todo.dueDate < now
    );

    // 计算平均完成时间
    const completionTimes = completedTodos
      .filter(todo => todo.createdAt && todo.updatedAt)
      .map(todo => {
        const completionTime = todo.updatedAt.getTime() - todo.createdAt.getTime();
        return completionTime / (1000 * 60 * 60); // 转换为小时
      });

    const averageCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      : 0;

    // 按优先级统计
    const todosByPriority = {
      high: categoryTodos.filter(todo => todo.priority === 1).length,
      medium: categoryTodos.filter(todo => todo.priority === 2).length,
      low: categoryTodos.filter(todo => todo.priority === 3).length,
      none: categoryTodos.filter(todo => !todo.priority).length,
    };

    // 按时间范围统计
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todosByTimeRange = {
      today: categoryTodos.filter(todo => todo.createdAt >= startOfToday).length,
      thisWeek: categoryTodos.filter(todo => todo.createdAt >= startOfWeek).length,
      thisMonth: categoryTodos.filter(todo => todo.createdAt >= startOfMonth).length,
      older: categoryTodos.filter(todo => todo.createdAt < startOfMonth).length,
    };

    return {
      categoryId: category.id,
      categoryName: category.name,
      totalTodos: categoryTodos.length,
      completedTodos: completedTodos.length,
      incompleteTodos: incompleteTodos.length,
      completionRate: categoryTodos.length > 0
        ? (completedTodos.length / categoryTodos.length) * 100
        : 0,
      overdueTodos: overdueTodos.length,
      overdueRate: incompleteTodos.length > 0
        ? (overdueTodos.length / incompleteTodos.length) * 100
        : 0,
      averageCompletionTime,
      todosByPriority,
      todosByTimeRange,
    };
  }

  getComparisonData(statistics: CategoryStatistics[]): {
    mostTodos: CategoryStatistics;
    highestCompletionRate: CategoryStatistics;
    lowestOverdueRate: CategoryStatistics;
    fastestCompletion: CategoryStatistics;
  } {
    if (statistics.length === 0) {
      throw new Error('没有可用的统计数据');
    }

    return {
      mostTodos: statistics.reduce((prev, curr) =>
        curr.totalTodos > prev.totalTodos ? curr : prev
      ),
      highestCompletionRate: statistics.reduce((prev, curr) =>
        curr.completionRate > prev.completionRate ? curr : prev
      ),
      lowestOverdueRate: statistics.reduce((prev, curr) =>
        curr.overdueRate < prev.overdueRate ? curr : prev
      ),
      fastestCompletion: statistics.reduce((prev, curr) =>
        curr.averageCompletionTime < prev.averageCompletionTime ? curr : prev
      ),
    };
  }

  getTrendData(todos: Todo[], category: Category, days: number): {
    dates: string[];
    completed: number[];
    created: number[];
  } {
    const result = {
      dates: [],
      completed: [],
      created: [],
    };

    const now = new Date();
    const categoryTodos = todos.filter(todo => todo.categoryId === category.id);

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const completedToday = categoryTodos.filter(todo =>
        todo.completed &&
        todo.updatedAt >= startOfDay &&
        todo.updatedAt < endOfDay
      ).length;

      const createdToday = categoryTodos.filter(todo =>
        todo.createdAt >= startOfDay &&
        todo.createdAt < endOfDay
      ).length;

      result.dates.push(dateString);
      result.completed.push(completedToday);
      result.created.push(createdToday);
    }

    return result;
  }
} 