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
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { QuickSearchService, QuickSearchItem } from '../services/quickSearchService';
import AnimatedView from './AnimatedView';

interface QuickSearchProps {
  onSelect: (filter: QuickSearchItem) => void;
  onSave?: (name: string, icon: string, filter: any) => void;
}

const QuickSearch: React.FC<QuickSearchProps> = ({
  onSelect,
  onSave,
}) => {
  const [searches, setSearches] = useState<QuickSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载快速搜索
  const loadQuickSearches = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await QuickSearchService.getQuickSearches();
      setSearches(items);
    } catch (error) {
      console.error('Error loading quick searches:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadQuickSearches();
  }, [loadQuickSearches]);

  // 处理删除
  const handleDelete = useCallback(async (id: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个快速搜索吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await QuickSearchService.deleteQuickSearch(id);
              await loadQuickSearches();
            } catch (error) {
              console.error('Error deleting quick search:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [loadQuickSearches]);

  // 处理重新排序
  const handleReorder = useCallback(async ({ from, to }) => {
    const reorderedSearches = [...searches];
    const [movedItem] = reorderedSearches.splice(from, 1);
    reorderedSearches.splice(to, 0, movedItem);

    try {
      await QuickSearchService.reorderQuickSearches(reorderedSearches);
      setSearches(reorderedSearches);
    } catch (error) {
      console.error('Error reordering quick searches:', error);
    }
  }, [searches]);

  if (isLoading) {
    return null;
  }

  if (searches.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>快速搜索</Text>
        {onSave && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onSave('', 'search', {})}
          >
            <MaterialIcons name="add" size={24} color="#2196F3" />
          </TouchableOpacity>
        )}
      </View>

      <DraggableFlatList
        data={searches}
        renderItem={({ item, drag, isActive }) => (
          <ScaleDecorator>
            <AnimatedView
              animation="fade"
              delay={item.order * 100}
            >
              <TouchableOpacity
                style={[
                  styles.searchItem,
                  isActive && styles.activeSearchItem,
                ]}
                onPress={() => onSelect(item)}
                onLongPress={drag}
              >
                <View style={styles.searchContent}>
                  <MaterialIcons
                    name="drag-handle"
                    size={20}
                    color="#bdbdbd"
                    style={styles.dragHandle}
                  />
                  <MaterialIcons
                    name={item.icon as any}
                    size={20}
                    color="#2196F3"
                  />
                  <Text style={styles.searchText}>{item.name}</Text>
                </View>
                {onSave && (
                  <View style={styles.searchActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => onSave(item.name, item.icon, item.filter)}
                    >
                      <MaterialIcons name="edit" size={20} color="#757575" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDelete(item.id)}
                    >
                      <MaterialIcons name="delete" size={20} color="#f44336" />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            </AnimatedView>
          </ScaleDecorator>
        )}
        keyExtractor={item => item.id}
        onDragEnd={handleReorder}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  addButton: {
    padding: 4,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeSearchItem: {
    backgroundColor: '#E3F2FD',
    elevation: 4,
    shadowOpacity: 0.25,
  },
  searchContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dragHandle: {
    marginRight: 12,
  },
  searchText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#212121',
  },
  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
});

export default memo(QuickSearch); 