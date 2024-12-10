import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  count: number;
}

export class SearchHistoryService {
  private static readonly STORAGE_KEY = '@SimpleTodo:search_history';
  private static readonly MAX_HISTORY_ITEMS = 100;

  // 添加搜索历史
  static async addSearchHistory(query: string): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      const existingItem = history.find(item => item.query === query);

      if (existingItem) {
        // 更新已存在的搜索记录
        existingItem.timestamp = new Date();
        existingItem.count += 1;
      } else {
        // 添加新的搜索记录
        history.unshift({
          query,
          timestamp: new Date(),
          count: 1,
        });

        // 限制历史记录数量
        if (history.length > this.MAX_HISTORY_ITEMS) {
          history.pop();
        }
      }

      // 保存历史记录
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(history)
      );
    } catch (error) {
      console.error('Error adding search history:', error);
      throw error;
    }
  }

  // 获取搜索历史
  static async getSearchHistory(): Promise<SearchHistoryItem[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (jsonValue === null) {
        return [];
      }
      const history = JSON.parse(jsonValue);
      return history.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
    } catch (error) {
      console.error('Error getting search history:', error);
      throw error;
    }
  }

  // 获取热门搜索
  static async getHotSearches(limit: number = 10): Promise<SearchHistoryItem[]> {
    try {
      const history = await this.getSearchHistory();
      return history
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting hot searches:', error);
      throw error;
    }
  }

  // 获取最近搜索
  static async getRecentSearches(limit: number = 10): Promise<SearchHistoryItem[]> {
    try {
      const history = await this.getSearchHistory();
      return history
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent searches:', error);
      throw error;
    }
  }

  // 删除搜索历史
  static async deleteSearchHistory(query: string): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      const filteredHistory = history.filter(item => item.query !== query);
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(filteredHistory)
      );
    } catch (error) {
      console.error('Error deleting search history:', error);
      throw error;
    }
  }

  // 清空搜索历史
  static async clearSearchHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  }

  // 获取搜索建议
  static async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      const history = await this.getSearchHistory();
      return history
        .filter(item => item.query.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map(item => item.query);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      throw error;
    }
  }
} 