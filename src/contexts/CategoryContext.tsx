import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category } from '../types/todo';
import { CategoryService } from '../services/categoryService';
import { IdGenerator } from '../utils/idGenerator';

export interface CategoryContextType {
  categories: Category[];
  isLoading: boolean;
  addCategory: (name: string, color: string, icon?: string) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (fromIndex: number, toIndex: number) => Promise<void>;
  refreshCategories: () => Promise<void>;
}

export const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化加载
  useEffect(() => {
    loadCategories();
  }, []);

  // 加载分类列表
  const loadCategories = async () => {
    try {
      const loadedCategories = await CategoryService.getCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新分类列表
  const refreshCategories = async () => {
    try {
      await loadCategories();
    } catch (error) {
      console.error('Error refreshing categories:', error);
      throw error;
    }
  };

  // 添加分类
  const addCategory = async (name: string, color: string, icon?: string) => {
    const newCategory: Category = {
      id: IdGenerator.generateUUID(),
      name,
      color,
      icon,
      order: categories.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await CategoryService.addCategory(newCategory);
      setCategories(prev => [...prev, newCategory]);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  // 更新分类
  const updateCategory = async (updatedCategory: Category) => {
    try {
      await CategoryService.updateCategory(updatedCategory);
      setCategories(prev =>
        prev.map(category =>
          category.id === updatedCategory.id ? updatedCategory : category
        )
      );
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  // 删除分类
  const deleteCategory = async (id: string) => {
    try {
      await CategoryService.deleteCategory(id);
      setCategories(prev => prev.filter(category => category.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  // 重新排序分类
  const reorderCategories = async (fromIndex: number, toIndex: number) => {
    const reorderedCategories = [...categories];
    const [movedCategory] = reorderedCategories.splice(fromIndex, 1);
    reorderedCategories.splice(toIndex, 0, movedCategory);

    try {
      await CategoryService.reorderCategories(reorderedCategories);
      setCategories(reorderedCategories);
    } catch (error) {
      console.error('Error reordering categories:', error);
      throw error;
    }
  };

  const value = {
    categories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    refreshCategories,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
}; 