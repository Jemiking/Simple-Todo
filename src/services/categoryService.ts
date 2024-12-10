import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from '../types/todo';

const STORAGE_KEY = '@SimpleTodo:';
const CATEGORY_KEY = `${STORAGE_KEY}categories`;
const AUTOSAVE_DEBOUNCE = 1000; // 1秒的防抖时间

export class CategoryService {
  private static saveTimeout: NodeJS.Timeout | null = null;

  // 保存所有分类（带防抖）
  static async saveCategories(categories: Category[]): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    return new Promise((resolve, reject) => {
      this.saveTimeout = setTimeout(async () => {
        try {
          const jsonValue = JSON.stringify(categories);
          await AsyncStorage.setItem(CATEGORY_KEY, jsonValue);
          resolve();
        } catch (error) {
          console.error('Error saving categories:', error);
          reject(error);
        }
      }, AUTOSAVE_DEBOUNCE);
    });
  }

  // 立即保存所有分类（不带防抖）
  static async saveCategoriesImmediately(categories: Category[]): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    try {
      const jsonValue = JSON.stringify(categories);
      await AsyncStorage.setItem(CATEGORY_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving categories:', error);
      throw error;
    }
  }

  // 获取所有分类（按顺序）
  static async getCategories(): Promise<Category[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(CATEGORY_KEY);
      if (jsonValue === null) {
        return [];
      }
      const categories = JSON.parse(jsonValue);
      // 转换日期字符串为Date对象并按顺序排序
      return categories
        .map((category: any) => ({
          ...category,
          createdAt: new Date(category.createdAt),
          updatedAt: new Date(category.updatedAt),
        }))
        .sort((a: Category, b: Category) => a.order - b.order);
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  // 添加分类
  static async addCategory(category: Category): Promise<void> {
    try {
      const categories = await this.getCategories();
      categories.push(category);
      await this.saveCategories(categories);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }

  // 更新分类
  static async updateCategory(updatedCategory: Category): Promise<void> {
    try {
      const categories = await this.getCategories();
      const index = categories.findIndex(category => category.id === updatedCategory.id);
      if (index !== -1) {
        categories[index] = updatedCategory;
        await this.saveCategories(categories);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // 删除分类
  static async deleteCategory(categoryId: string): Promise<void> {
    try {
      const categories = await this.getCategories();
      const filteredCategories = categories.filter(category => category.id !== categoryId);
      await this.saveCategoriesImmediately(filteredCategories); // 删除操作立即保存
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // 重新排序分类
  static async reorderCategories(categories: Category[]): Promise<void> {
    try {
      // 更新每个分类的顺序号
      const updatedCategories = categories.map((category, index) => ({
        ...category,
        order: index,
        updatedAt: new Date(),
      }));

      await this.saveCategoriesImmediately(updatedCategories);
    } catch (error) {
      console.error('Error reordering categories:', error);
      throw error;
    }
  }
} 