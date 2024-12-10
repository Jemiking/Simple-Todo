import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from '../types/todo';

const STORAGE_KEY = '@SimpleTodo:';
const TODO_KEY = `${STORAGE_KEY}todos`;
const AUTOSAVE_DEBOUNCE = 1000; // 1秒的防抖时间

const serializeTodo = (todo: Todo): string => {
  return JSON.stringify({
    ...todo,
    dueDate: todo.dueDate?.toISOString(),
    reminderTime: todo.reminderTime?.toISOString(),
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  });
};

const deserializeTodo = (json: string): Todo => {
  const data = JSON.parse(json);
  return {
    ...data,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    reminderTime: data.reminderTime ? new Date(data.reminderTime) : undefined,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
};

export class StorageService {
  private static saveTimeout: NodeJS.Timeout | null = null;

  // 保存所有Todo项（带防抖）
  static async saveTodos(todos: Todo[]): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    return new Promise((resolve, reject) => {
      this.saveTimeout = setTimeout(async () => {
        try {
          const jsonValue = JSON.stringify(todos);
          await AsyncStorage.setItem(TODO_KEY, jsonValue);
          resolve();
        } catch (error) {
          console.error('Error saving todos:', error);
          reject(error);
        }
      }, AUTOSAVE_DEBOUNCE);
    });
  }

  // 立即保存所有Todo项（不带防抖）
  static async saveTodosImmediately(todos: Todo[]): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    try {
      const jsonValue = JSON.stringify(todos);
      await AsyncStorage.setItem(TODO_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving todos:', error);
      throw error;
    }
  }

  // 获取所有Todo项
  static async getTodos(): Promise<Todo[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(TODO_KEY);
      if (jsonValue === null) {
        return [];
      }
      const todos = JSON.parse(jsonValue);
      // 转换日期字符串为Date对象
      return todos.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
      }));
    } catch (error) {
      console.error('Error getting todos:', error);
      throw error;
    }
  }

  // 添加单个Todo项
  static async addTodo(todo: Todo): Promise<void> {
    try {
      const todos = await this.getTodos();
      todos.push(todo);
      await this.saveTodos(todos);
    } catch (error) {
      console.error('Error adding todo:', error);
      throw error;
    }
  }

  // 更新单个Todo项
  static async updateTodo(updatedTodo: Todo): Promise<void> {
    try {
      const todos = await this.getTodos();
      const index = todos.findIndex(todo => todo.id === updatedTodo.id);
      if (index !== -1) {
        todos[index] = updatedTodo;
        await this.saveTodos(todos);
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  // 删除单个Todo项
  static async deleteTodo(todoId: string): Promise<void> {
    try {
      const todos = await this.getTodos();
      const filteredTodos = todos.filter(todo => todo.id !== todoId);
      await this.saveTodosImmediately(filteredTodos); // 删除操作立即保存
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }

  // 清除所有数据
  static async clearAll(): Promise<void> {
    try {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
} 