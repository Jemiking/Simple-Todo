import AsyncStorage from '@react-native-async-storage/async-storage';
import { FilterOptions } from './filterService';

export interface QuickSearchItem {
  id: string;
  name: string;
  icon: string;
  filter: FilterOptions;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export class QuickSearchService {
  private static readonly STORAGE_KEY = '@SimpleTodo:quick_searches';

  // 获取所有快速搜索
  static async getQuickSearches(): Promise<QuickSearchItem[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (jsonValue === null) {
        return this.getDefaultQuickSearches();
      }
      const searches = JSON.parse(jsonValue);
      return searches.map((search: any) => ({
        ...search,
        createdAt: new Date(search.createdAt),
        updatedAt: new Date(search.updatedAt),
      }));
    } catch (error) {
      console.error('Error getting quick searches:', error);
      return this.getDefaultQuickSearches();
    }
  }

  // 添加快速搜索
  static async addQuickSearch(name: string, icon: string, filter: FilterOptions): Promise<void> {
    try {
      const searches = await this.getQuickSearches();
      const newSearch: QuickSearchItem = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        icon,
        filter,
        order: searches.length,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      searches.push(newSearch);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(searches));
    } catch (error) {
      console.error('Error adding quick search:', error);
      throw error;
    }
  }

  // 更新快速搜索
  static async updateQuickSearch(id: string, updates: Partial<QuickSearchItem>): Promise<void> {
    try {
      const searches = await this.getQuickSearches();
      const index = searches.findIndex(search => search.id === id);
      if (index !== -1) {
        searches[index] = {
          ...searches[index],
          ...updates,
          updatedAt: new Date(),
        };
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(searches));
      }
    } catch (error) {
      console.error('Error updating quick search:', error);
      throw error;
    }
  }

  // 删除快速搜索
  static async deleteQuickSearch(id: string): Promise<void> {
    try {
      const searches = await this.getQuickSearches();
      const filteredSearches = searches.filter(search => search.id !== id);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSearches));
    } catch (error) {
      console.error('Error deleting quick search:', error);
      throw error;
    }
  }

  // 重新排序快速搜索
  static async reorderQuickSearches(searches: QuickSearchItem[]): Promise<void> {
    try {
      const updatedSearches = searches.map((search, index) => ({
        ...search,
        order: index,
        updatedAt: new Date(),
      }));
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Error reordering quick searches:', error);
      throw error;
    }
  }

  // 获取默认快速搜索
  private static getDefaultQuickSearches(): QuickSearchItem[] {
    return [
      {
        id: 'today',
        name: '今日待办',
        icon: 'today',
        filter: {
          completed: false,
          startDate: new Date(),
          endDate: new Date(),
        },
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'overdue',
        name: '已逾期',
        icon: 'warning',
        filter: {
          completed: false,
          isOverdue: true,
        },
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'high_priority',
        name: '高优先级',
        icon: 'priority-high',
        filter: {
          completed: false,
          priority: 1,
        },
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'no_category',
        name: '未分类',
        icon: 'folder-off',
        filter: {
          completed: false,
          categoryId: undefined,
        },
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'no_date',
        name: '无截止日期',
        icon: 'event-busy',
        filter: {
          completed: false,
          hasDueDate: false,
        },
        order: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
} 