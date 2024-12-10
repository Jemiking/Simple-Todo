import React, { memo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SearchHistoryService, SearchHistoryItem } from '../services/searchHistoryService';
import AnimatedView from './AnimatedView';

interface SearchHistoryProps {
  onSelect: (query: string) => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({
  onSelect,
}) => {
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);
  const [hotSearches, setHotSearches] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载搜索历史
  const loadSearchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const [recent, hot] = await Promise.all([
        SearchHistoryService.getRecentSearches(5),
        SearchHistoryService.getHotSearches(5),
      ]);
      setRecentSearches(recent);
      setHotSearches(hot);
    } catch (error) {
      console.error('Error loading search history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadSearchHistory();
  }, [loadSearchHistory]);

  // 处理删除搜索历史
  const handleDelete = useCallback(async (query: string) => {
    try {
      await SearchHistoryService.deleteSearchHistory(query);
      await loadSearchHistory();
    } catch (error) {
      console.error('Error deleting search history:', error);
    }
  }, [loadSearchHistory]);

  // 处理清空搜索历史
  const handleClear = useCallback(async () => {
    Alert.alert(
      '确认清空',
      '确定要清空所有搜索历史吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '清空',
          style: 'destructive',
          onPress: async () => {
            try {
              await SearchHistoryService.clearSearchHistory();
              await loadSearchHistory();
            } catch (error) {
              console.error('Error clearing search history:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [loadSearchHistory]);

  if (isLoading) {
    return null;
  }

  if (recentSearches.length === 0 && hotSearches.length === 0) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* 最近搜索 */}
      {recentSearches.length > 0 && (
        <AnimatedView
          animation="fade"
          delay={0}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>最近搜索</Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
            >
              <MaterialIcons name="delete-outline" size={20} color="#757575" />
              <Text style={styles.clearButtonText}>清空</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagGrid}>
            {recentSearches.map((item, index) => (
              <AnimatedView
                key={item.query}
                animation="fade"
                delay={index * 100}
              >
                <TouchableOpacity
                  style={styles.tag}
                  onPress={() => onSelect(item.query)}
                >
                  <MaterialIcons name="history" size={16} color="#757575" />
                  <Text style={styles.tagText}>{item.query}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.query)}
                  >
                    <MaterialIcons name="close" size={16} color="#757575" />
                  </TouchableOpacity>
                </TouchableOpacity>
              </AnimatedView>
            ))}
          </View>
        </AnimatedView>
      )}

      {/* 热门搜索 */}
      {hotSearches.length > 0 && (
        <AnimatedView
          animation="fade"
          delay={300}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>热门搜索</Text>
          </View>
          <View style={styles.tagGrid}>
            {hotSearches.map((item, index) => (
              <AnimatedView
                key={item.query}
                animation="fade"
                delay={300 + index * 100}
              >
                <TouchableOpacity
                  style={styles.tag}
                  onPress={() => onSelect(item.query)}
                >
                  <MaterialIcons name="local-fire-department" size={16} color="#f44336" />
                  <Text style={styles.tagText}>{item.query}</Text>
                  <Text style={styles.countText}>{item.count}</Text>
                </TouchableOpacity>
              </AnimatedView>
            ))}
          </View>
        </AnimatedView>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#757575',
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
  },
  tagText: {
    marginLeft: 8,
    marginRight: 4,
    fontSize: 14,
    color: '#212121',
  },
  deleteButton: {
    padding: 4,
  },
  countText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#757575',
  },
});

export default memo(SearchHistory); 