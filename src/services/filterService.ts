import { Todo, TodoPriority } from '../types/todo';

export interface FilterOptions {
  completed?: boolean;
  categoryId?: string;
  tagIds?: string[];
  priority?: TodoPriority;
  startDate?: Date;
  endDate?: Date;
  hasDescription?: boolean;
  hasSubTasks?: boolean;
  hasRepeat?: boolean;
  hasDueDate?: boolean;
  isOverdue?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
}

export class FilterService {
  // 筛选Todo项
  static filterTodos(todos: Todo[], options: FilterOptions): Todo[] {
    return todos.filter(todo => {
      // 完成状态筛选
      if (options.completed !== undefined && todo.completed !== options.completed) {
        return false;
      }

      // 分类筛选
      if (options.categoryId && todo.categoryId !== options.categoryId) {
        return false;
      }

      // 标签筛选
      if (options.tagIds && options.tagIds.length > 0) {
        if (!options.tagIds.every(tagId => todo.tagIds.includes(tagId))) {
          return false;
        }
      }

      // 优先级筛选
      if (options.priority !== undefined && todo.priority !== options.priority) {
        return false;
      }

      // 日期范围筛选
      if (options.startDate && todo.dueDate && todo.dueDate < options.startDate) {
        return false;
      }
      if (options.endDate && todo.dueDate && todo.dueDate > options.endDate) {
        return false;
      }

      // 描述筛选
      if (options.hasDescription !== undefined) {
        const hasDescription = !!todo.description && todo.description.trim().length > 0;
        if (hasDescription !== options.hasDescription) {
          return false;
        }
      }

      // 子任务筛选
      if (options.hasSubTasks !== undefined) {
        const hasSubTasks = todo.subTasks.length > 0;
        if (hasSubTasks !== options.hasSubTasks) {
          return false;
        }
      }

      // 重复任务筛选
      if (options.hasRepeat !== undefined) {
        const hasRepeat = !!todo.repeat;
        if (hasRepeat !== options.hasRepeat) {
          return false;
        }
      }

      // 截止日期筛选
      if (options.hasDueDate !== undefined) {
        const hasDueDate = !!todo.dueDate;
        if (hasDueDate !== options.hasDueDate) {
          return false;
        }
      }

      // 逾期筛选
      if (options.isOverdue !== undefined) {
        const now = new Date();
        const isOverdue = !todo.completed && todo.dueDate && todo.dueDate < now;
        if (isOverdue !== options.isOverdue) {
          return false;
        }
      }

      // 创建时间筛选
      if (options.createdAfter && todo.createdAt < options.createdAfter) {
        return false;
      }
      if (options.createdBefore && todo.createdAt > options.createdBefore) {
        return false;
      }

      // 更新时间筛选
      if (options.updatedAfter && todo.updatedAt < options.updatedAfter) {
        return false;
      }
      if (options.updatedBefore && todo.updatedAt > options.updatedBefore) {
        return false;
      }

      return true;
    });
  }

  // 保存筛选条件
  static saveFilter(name: string, options: FilterOptions): Promise<void> {
    return new Promise((resolve) => {
      const filters = this.getFilters();
      filters[name] = options;
      localStorage.setItem('todo_filters', JSON.stringify(filters));
      resolve();
    });
  }

  // 获取所有保存的筛选条件
  static getFilters(): { [key: string]: FilterOptions } {
    const filtersJson = localStorage.getItem('todo_filters');
    return filtersJson ? JSON.parse(filtersJson) : {};
  }

  // 删除筛选条件
  static deleteFilter(name: string): Promise<void> {
    return new Promise((resolve) => {
      const filters = this.getFilters();
      delete filters[name];
      localStorage.setItem('todo_filters', JSON.stringify(filters));
      resolve();
    });
  }

  // 清除所有筛选条件
  static clearFilters(): Promise<void> {
    return new Promise((resolve) => {
      localStorage.removeItem('todo_filters');
      resolve();
    });
  }
} 