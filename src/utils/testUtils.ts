import { Todo, Category, Tag } from '../types/todo';
import { StorageService } from '../services/storage';
import { CategoryService } from '../services/categoryService';
import { TagService } from '../services/tagService';
import { TestDataGenerator } from './testDataGenerator';

export class TestUtils {
  // 清理所有数据
  static async cleanupData(): Promise<void> {
    try {
      await StorageService.clearAll();
    } catch (error) {
      console.error('Error cleaning up data:', error);
      throw error;
    }
  }

  // 加载测试数据
  static async loadTestData(
    todoCount: number = 100,
    categoryCount: number = 10,
    tagCount: number = 20,
  ): Promise<void> {
    try {
      // 生成测试数据
      const { todos, categories, tags } = TestDataGenerator.generateTestData(
        todoCount,
        categoryCount,
        tagCount,
      );

      // 保存数据
      await Promise.all([
        StorageService.saveTodosImmediately(todos),
        CategoryService.saveCategoriesImmediately(categories),
        TagService.saveTagsImmediately(tags),
      ]);
    } catch (error) {
      console.error('Error loading test data:', error);
      throw error;
    }
  }

  // 验证Todo项
  static validateTodo(todo: Todo): string[] {
    const errors: string[] = [];

    // 验证必填字段
    if (!todo.id) errors.push('Todo ID is required');
    if (!todo.title) errors.push('Todo title is required');
    if (!todo.createdAt) errors.push('Todo createdAt is required');
    if (!todo.updatedAt) errors.push('Todo updatedAt is required');

    // 验证字段类型
    if (typeof todo.completed !== 'boolean') errors.push('Todo completed must be boolean');
    if (todo.dueDate && !(todo.dueDate instanceof Date)) errors.push('Todo dueDate must be Date');
    if (!Array.isArray(todo.subTasks)) errors.push('Todo subTasks must be array');
    if (!Array.isArray(todo.tagIds)) errors.push('Todo tagIds must be array');

    // 验证子任务
    todo.subTasks.forEach((subTask, index) => {
      if (!subTask.id) errors.push(`SubTask ${index} ID is required`);
      if (!subTask.title) errors.push(`SubTask ${index} title is required`);
      if (typeof subTask.completed !== 'boolean') errors.push(`SubTask ${index} completed must be boolean`);
    });

    return errors;
  }

  // 验证分类
  static validateCategory(category: Category): string[] {
    const errors: string[] = [];

    // 验证必填字段
    if (!category.id) errors.push('Category ID is required');
    if (!category.name) errors.push('Category name is required');
    if (!category.color) errors.push('Category color is required');
    if (typeof category.order !== 'number') errors.push('Category order must be number');
    if (!category.createdAt) errors.push('Category createdAt is required');
    if (!category.updatedAt) errors.push('Category updatedAt is required');

    return errors;
  }

  // 验证标签
  static validateTag(tag: Tag): string[] {
    const errors: string[] = [];

    // 验证必填字段
    if (!tag.id) errors.push('Tag ID is required');
    if (!tag.name) errors.push('Tag name is required');
    if (!tag.color) errors.push('Tag color is required');
    if (!tag.createdAt) errors.push('Tag createdAt is required');
    if (!tag.updatedAt) errors.push('Tag updatedAt is required');

    return errors;
  }

  // 验证数据集
  static validateData(
    todos: Todo[],
    categories: Category[],
    tags: Tag[],
  ): {
    todoErrors: { [id: string]: string[] };
    categoryErrors: { [id: string]: string[] };
    tagErrors: { [id: string]: string[] };
  } {
    const todoErrors: { [id: string]: string[] } = {};
    const categoryErrors: { [id: string]: string[] } = {};
    const tagErrors: { [id: string]: string[] } = {};

    // 验证Todo项
    todos.forEach(todo => {
      const errors = this.validateTodo(todo);
      if (errors.length > 0) {
        todoErrors[todo.id] = errors;
      }
    });

    // 验证分类
    categories.forEach(category => {
      const errors = this.validateCategory(category);
      if (errors.length > 0) {
        categoryErrors[category.id] = errors;
      }
    });

    // 验证标签
    tags.forEach(tag => {
      const errors = this.validateTag(tag);
      if (errors.length > 0) {
        tagErrors[tag.id] = errors;
      }
    });

    return {
      todoErrors,
      categoryErrors,
      tagErrors,
    };
  }

  // 性能测试：数据加载
  static async testDataLoadingPerformance(
    todoCount: number = 1000,
  ): Promise<{
    loadTime: number;
    parseTime: number;
    totalTime: number;
  }> {
    const startTime = performance.now();
    let loadTime = 0;
    let parseTime = 0;

    try {
      // 测试数据加载时间
      const loadStartTime = performance.now();
      const todos = await StorageService.getTodos();
      loadTime = performance.now() - loadStartTime;

      // 测试数据解析时间
      const parseStartTime = performance.now();
      todos.forEach(todo => {
        this.validateTodo(todo);
      });
      parseTime = performance.now() - parseStartTime;

      const totalTime = performance.now() - startTime;

      return {
        loadTime,
        parseTime,
        totalTime,
      };
    } catch (error) {
      console.error('Error testing data loading performance:', error);
      throw error;
    }
  }

  // 性能测试：数据保存
  static async testDataSavingPerformance(
    todoCount: number = 1000,
  ): Promise<{
    generateTime: number;
    saveTime: number;
    totalTime: number;
  }> {
    const startTime = performance.now();
    let generateTime = 0;
    let saveTime = 0;

    try {
      // 测试数据生成时间
      const generateStartTime = performance.now();
      const { todos } = TestDataGenerator.generateTestData(todoCount);
      generateTime = performance.now() - generateStartTime;

      // 测试数据保存时间
      const saveStartTime = performance.now();
      await StorageService.saveTodosImmediately(todos);
      saveTime = performance.now() - saveStartTime;

      const totalTime = performance.now() - startTime;

      return {
        generateTime,
        saveTime,
        totalTime,
      };
    } catch (error) {
      console.error('Error testing data saving performance:', error);
      throw error;
    }
  }

  // 性能测试：搜索性能
  static async testSearchPerformance(
    query: string,
    todoCount: number = 1000,
  ): Promise<{
    searchTime: number;
    resultCount: number;
  }> {
    try {
      // 加载测试数据
      await this.loadTestData(todoCount);

      // 测试搜索性能
      const startTime = performance.now();
      const todos = await StorageService.getTodos();
      const results = todos.filter(todo =>
        todo.title.toLowerCase().includes(query.toLowerCase()) ||
        todo.description?.toLowerCase().includes(query.toLowerCase())
      );
      const searchTime = performance.now() - startTime;

      return {
        searchTime,
        resultCount: results.length,
      };
    } catch (error) {
      console.error('Error testing search performance:', error);
      throw error;
    }
  }

  // 性能测试：筛选性能
  static async testFilterPerformance(
    todoCount: number = 1000,
  ): Promise<{
    filterTime: number;
    resultCount: number;
  }> {
    try {
      // 加载测试数据
      await this.loadTestData(todoCount);

      // 测试筛选性能
      const startTime = performance.now();
      const todos = await StorageService.getTodos();
      const results = todos.filter(todo =>
        !todo.completed &&
        todo.dueDate &&
        todo.dueDate > new Date()
      );
      const filterTime = performance.now() - startTime;

      return {
        filterTime,
        resultCount: results.length,
      };
    } catch (error) {
      console.error('Error testing filter performance:', error);
      throw error;
    }
  }
} 