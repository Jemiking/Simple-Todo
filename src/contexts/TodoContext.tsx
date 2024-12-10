import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Todo } from '../types/todo';
import { StorageService } from '../services/storage';
import { SyncService } from '../services/sync/SyncService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TodoContextType {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTodo: (todo: Todo) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodoComplete: (id: string) => Promise<void>;
  syncTodos: () => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);

  // 初始化同步服务
  useEffect(() => {
    const initializeSync = async () => {
      try {
        const configStr = await AsyncStorage.getItem('@sync_config');
        if (configStr) {
          const config = JSON.parse(configStr);
          const syncService = SyncService.getInstance();
          await syncService.initialize(config);
        }
      } catch (error) {
        console.error('初始化同步服务失败:', error);
      }
    };

    initializeSync();
  }, []);

  // 加载Todo列表
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const loadedTodos = await StorageService.loadTodos();
        setTodos(loadedTodos);
      } catch (error) {
        console.error('加载Todo列表失败:', error);
      }
    };

    loadTodos();
  }, []);

  // 同步数据
  const syncTodos = useCallback(async () => {
    try {
      const syncService = SyncService.getInstance();
      if (!syncService.isEnabled()) {
        return;
      }

      const remoteTodos = await syncService.sync(todos);
      setTodos(remoteTodos);
      await StorageService.saveTodos(remoteTodos);
    } catch (error) {
      console.error('同步失败:', error);
      throw error;
    }
  }, [todos]);

  // 添加Todo
  const addTodo = useCallback(async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTodo: Todo = {
        ...todo,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await StorageService.addTodo(newTodo);
      setTodos(prev => [...prev, newTodo]);
      await syncTodos();
    } catch (error) {
      console.error('添加Todo失败:', error);
      throw error;
    }
  }, [syncTodos]);

  // 更新Todo
  const updateTodo = useCallback(async (updatedTodo: Todo) => {
    try {
      const todo = { ...updatedTodo, updatedAt: new Date() };
      await StorageService.updateTodo(todo);
      setTodos(prev => prev.map(t => t.id === todo.id ? todo : t));
      await syncTodos();
    } catch (error) {
      console.error('更新Todo失败:', error);
      throw error;
    }
  }, [syncTodos]);

  // 删除Todo
  const deleteTodo = useCallback(async (id: string) => {
    try {
      await StorageService.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      await syncTodos();
    } catch (error) {
      console.error('删除Todo失败:', error);
      throw error;
    }
  }, [syncTodos]);

  // 切换完成状态
  const toggleTodoComplete = useCallback(async (id: string) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (todo) {
        const updatedTodo = { ...todo, completed: !todo.completed, updatedAt: new Date() };
        await StorageService.updateTodo(updatedTodo);
        setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
        await syncTodos();
      }
    } catch (error) {
      console.error('切换Todo状态失败:', error);
      throw error;
    }
  }, [todos, syncTodos]);

  return (
    <TodoContext.Provider
      value={{
        todos,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleTodoComplete,
        syncTodos,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
}; 