import { Todo, TodoPriority } from '../types/todo';
import { format, isWithinInterval, startOfDay, endOfDay, subDays } from 'date-fns';

export interface StatisticsFilter {
  startDate?: Date;
  endDate?: Date;
  categoryIds?: string[];
  tagIds?: string[];
  priorities?: TodoPriority[];
  includeCompleted?: boolean;
  includeIncomplete?: boolean;
  includeOverdue?: boolean;
}

export interface StatisticsResult {
  totalTodos: number;
  completedTodos: number;
  incompleteTodos: number;
  overdueTodos: number;
  completionRate: number;
  overdueRate: number;
  averageCompletionTime: number;
  todosByPriority: {
    high: number;
    medium: number;
    low: number;
    none: number;
  };
  todosByCategory: {
    [categoryId: string]: number;
  };
  todosByTag: {
    [tagId: string]: number;
  };
  todosByDate: {
    [date: string]: {
      created: number;
      completed: number;
    };
  };
  completionTimeDistribution: {
    lessThanHour: number;
    oneToThreeHours: number;
    threeToSixHours: number;
    sixToTwelveHours: number;
    twelveToTwentyFourHours: number;
    moreThanDay: number;
  };
}

export class CustomStatisticsService {
  private static instance: CustomStatisticsService;

  private constructor() {}

  static getInstance(): CustomStatisticsService {
    if (!CustomStatisticsService.instance) {
      CustomStatisticsService.instance = new CustomStatisticsService();
    }
    return CustomStatisticsService.instance;
  }

  calculateStatistics(todos: Todo[], filter: StatisticsFilter): StatisticsResult {
    // 应用过滤器
    let filteredTodos = this.filterTodos(todos, filter);

    // 计算基本统计
    const completedTodos = filteredTodos.filter(todo => todo.completed);
    const incompleteTodos = filteredTodos.filter(todo => !todo.completed);
    const overdueTodos = incompleteTodos.filter(todo =>
      todo.dueDate && todo.dueDate < new Date()
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
      high: filteredTodos.filter(todo => todo.priority === TodoPriority.High).length,
      medium: filteredTodos.filter(todo => todo.priority === TodoPriority.Medium).length,
      low: filteredTodos.filter(todo => todo.priority === TodoPriority.Low).length,
      none: filteredTodos.filter(todo => !todo.priority).length,
    };

    // 按分类统计
    const todosByCategory = filteredTodos.reduce((acc, todo) => {
      if (todo.categoryId) {
        acc[todo.categoryId] = (acc[todo.categoryId] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });

    // 按标签统计
    const todosByTag = filteredTodos.reduce((acc, todo) => {
      todo.tagIds.forEach(tagId => {
        acc[tagId] = (acc[tagId] || 0) + 1;
      });
      return acc;
    }, {} as { [key: string]: number });

    // 按日期统计
    const todosByDate = this.calculateTodosByDate(filteredTodos, filter);

    // 计算完成时间分布
    const completionTimeDistribution = this.calculateCompletionTimeDistribution(completedTodos);

    return {
      totalTodos: filteredTodos.length,
      completedTodos: completedTodos.length,
      incompleteTodos: incompleteTodos.length,
      overdueTodos: overdueTodos.length,
      completionRate: filteredTodos.length > 0
        ? (completedTodos.length / filteredTodos.length) * 100
        : 0,
      overdueRate: incompleteTodos.length > 0
        ? (overdueTodos.length / incompleteTodos.length) * 100
        : 0,
      averageCompletionTime,
      todosByPriority,
      todosByCategory,
      todosByTag,
      todosByDate,
      completionTimeDistribution,
    };
  }

  private filterTodos(todos: Todo[], filter: StatisticsFilter): Todo[] {
    return todos.filter(todo => {
      // 日期范围过滤
      if (filter.startDate && filter.endDate) {
        const todoDate = todo.createdAt;
        if (!isWithinInterval(todoDate, {
          start: startOfDay(filter.startDate),
          end: endOfDay(filter.endDate),
        })) {
          return false;
        }
      }

      // 分类过滤
      if (filter.categoryIds && filter.categoryIds.length > 0) {
        if (!todo.categoryId || !filter.categoryIds.includes(todo.categoryId)) {
          return false;
        }
      }

      // 标签过滤
      if (filter.tagIds && filter.tagIds.length > 0) {
        if (!filter.tagIds.some(tagId => todo.tagIds.includes(tagId))) {
          return false;
        }
      }

      // 优先级过滤
      if (filter.priorities && filter.priorities.length > 0) {
        if (!todo.priority || !filter.priorities.includes(todo.priority)) {
          return false;
        }
      }

      // 完成状态过滤
      if (filter.includeCompleted === false && todo.completed) {
        return false;
      }
      if (filter.includeIncomplete === false && !todo.completed) {
        return false;
      }

      // 逾期状态过滤
      if (filter.includeOverdue === false && todo.dueDate && todo.dueDate < new Date()) {
        return false;
      }

      return true;
    });
  }

  private calculateTodosByDate(todos: Todo[], filter: StatisticsFilter): { [key: string]: { created: number; completed: number } } {
    const result: { [key: string]: { created: number; completed: number } } = {};
    const startDate = filter.startDate || subDays(new Date(), 30);
    const endDate = filter.endDate || new Date();

    // 初始化日期范围内的所有日期
    let currentDate = startOfDay(startDate);
    while (currentDate <= endDate) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      result[dateString] = { created: 0, completed: 0 };
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    // 统计每日创建和完成的任务数
    todos.forEach(todo => {
      const createdDate = format(todo.createdAt, 'yyyy-MM-dd');
      if (result[createdDate]) {
        result[createdDate].created++;
      }

      if (todo.completed && todo.updatedAt) {
        const completedDate = format(todo.updatedAt, 'yyyy-MM-dd');
        if (result[completedDate]) {
          result[completedDate].completed++;
        }
      }
    });

    return result;
  }

  private calculateCompletionTimeDistribution(completedTodos: Todo[]): StatisticsResult['completionTimeDistribution'] {
    const distribution = {
      lessThanHour: 0,
      oneToThreeHours: 0,
      threeToSixHours: 0,
      sixToTwelveHours: 0,
      twelveToTwentyFourHours: 0,
      moreThanDay: 0,
    };

    completedTodos.forEach(todo => {
      if (!todo.createdAt || !todo.updatedAt) return;

      const completionTime = (todo.updatedAt.getTime() - todo.createdAt.getTime()) / (1000 * 60 * 60); // 小时

      if (completionTime < 1) {
        distribution.lessThanHour++;
      } else if (completionTime < 3) {
        distribution.oneToThreeHours++;
      } else if (completionTime < 6) {
        distribution.threeToSixHours++;
      } else if (completionTime < 12) {
        distribution.sixToTwelveHours++;
      } else if (completionTime < 24) {
        distribution.twelveToTwentyFourHours++;
      } else {
        distribution.moreThanDay++;
      }
    });

    return distribution;
  }

  getComparisonWithPreviousPeriod(
    currentStats: StatisticsResult,
    previousStats: StatisticsResult
  ): {
    totalTodosChange: number;
    completionRateChange: number;
    overdueRateChange: number;
    averageCompletionTimeChange: number;
  } {
    return {
      totalTodosChange: this.calculatePercentageChange(
        previousStats.totalTodos,
        currentStats.totalTodos
      ),
      completionRateChange: currentStats.completionRate - previousStats.completionRate,
      overdueRateChange: currentStats.overdueRate - previousStats.overdueRate,
      averageCompletionTimeChange: this.calculatePercentageChange(
        previousStats.averageCompletionTime,
        currentStats.averageCompletionTime
      ),
    };
  }

  private calculatePercentageChange(previous: number, current: number): number {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / previous) * 100;
  }
} 