import { Todo, TodoPriority, RepeatType, SubTask, Category, Tag } from '../types/todo';
import { IdGenerator } from './idGenerator';

export class TestDataGenerator {
  // 生成随机日期
  static randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  // 生成随机字符串
  static randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 生成随机颜色
  static randomColor(): string {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  }

  // 生成随机布尔值
  static randomBoolean(): boolean {
    return Math.random() > 0.5;
  }

  // 生成随机优先级
  static randomPriority(): TodoPriority {
    const priorities = [TodoPriority.High, TodoPriority.Medium, TodoPriority.Low];
    return priorities[Math.floor(Math.random() * priorities.length)];
  }

  // 生��随机重复类型
  static randomRepeatType(): RepeatType {
    const types = [
      RepeatType.Daily,
      RepeatType.Weekly,
      RepeatType.Monthly,
      RepeatType.Yearly,
      RepeatType.Custom,
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  // 生成子任务
  static generateSubTask(): SubTask {
    const now = new Date();
    return {
      id: IdGenerator.generateUUID(),
      title: `子任务 ${this.randomString(10)}`,
      completed: this.randomBoolean(),
      createdAt: now,
      updatedAt: now,
    };
  }

  // 生成分类
  static generateCategory(order: number): Category {
    const now = new Date();
    return {
      id: IdGenerator.generateUUID(),
      name: `分类 ${this.randomString(5)}`,
      color: this.randomColor(),
      icon: 'folder',
      order,
      createdAt: now,
      updatedAt: now,
    };
  }

  // 生成标签
  static generateTag(): Tag {
    const now = new Date();
    return {
      id: IdGenerator.generateUUID(),
      name: `标签 ${this.randomString(5)}`,
      color: this.randomColor(),
      createdAt: now,
      updatedAt: now,
    };
  }

  // 生成Todo项
  static generateTodo(categories: Category[], tags: Tag[]): Todo {
    const now = new Date();
    const dueDate = this.randomBoolean() ? this.randomDate(now, new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) : undefined;
    const subTaskCount = Math.floor(Math.random() * 5);
    const subTasks: SubTask[] = [];
    for (let i = 0; i < subTaskCount; i++) {
      subTasks.push(this.generateSubTask());
    }

    const tagCount = Math.floor(Math.random() * 3);
    const tagIds: string[] = [];
    for (let i = 0; i < tagCount; i++) {
      if (tags[i]) {
        tagIds.push(tags[i].id);
      }
    }

    return {
      id: IdGenerator.generateUUID(),
      title: `待办事项 ${this.randomString(10)}`,
      description: this.randomBoolean() ? `描述 ${this.randomString(20)}` : undefined,
      completed: this.randomBoolean(),
      dueDate,
      priority: this.randomBoolean() ? this.randomPriority() : undefined,
      subTasks,
      repeat: this.randomBoolean() ? {
        type: this.randomRepeatType(),
        interval: Math.floor(Math.random() * 10) + 1,
      } : undefined,
      categoryId: this.randomBoolean() && categories.length > 0
        ? categories[Math.floor(Math.random() * categories.length)].id
        : undefined,
      tagIds,
      createdAt: now,
      updatedAt: now,
    };
  }

  // 生成测试数据集
  static generateTestData(
    todoCount: number = 100,
    categoryCount: number = 10,
    tagCount: number = 20,
  ): {
    todos: Todo[];
    categories: Category[];
    tags: Tag[];
  } {
    // 生成分类
    const categories: Category[] = [];
    for (let i = 0; i < categoryCount; i++) {
      categories.push(this.generateCategory(i));
    }

    // 生成标签
    const tags: Tag[] = [];
    for (let i = 0; i < tagCount; i++) {
      tags.push(this.generateTag());
    }

    // 生成Todo项
    const todos: Todo[] = [];
    for (let i = 0; i < todoCount; i++) {
      todos.push(this.generateTodo(categories, tags));
    }

    return {
      todos,
      categories,
      tags,
    };
  }
} 