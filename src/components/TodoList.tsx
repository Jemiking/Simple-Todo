import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useGesture } from '../contexts/GestureContext';
import { Todo } from '../types/todo';
import TodoItem from './TodoItem';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface TodoListProps {
  todos: Todo[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggleComplete,
  onDelete,
  onRefresh,
  isRefreshing,
}) => {
  const { theme } = useTheme();
  const { isLongPressToSelectEnabled } = useGesture();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const handleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newIds = prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id];
      
      if (newIds.length === 0) {
        setIsSelectionMode(false);
      }
      
      return newIds;
    });
    
    if (!isSelectionMode) {
      setIsSelectionMode(true);
    }
  }, [isSelectionMode]);

  const handleBatchComplete = useCallback(() => {
    Alert.alert(
      '批量完成',
      `确定要将选中的 ${selectedIds.length} 个待办事项标记为已完成吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: () => {
            selectedIds.forEach(id => onToggleComplete(id));
            setSelectedIds([]);
            setIsSelectionMode(false);
          },
        },
      ]
    );
  }, [selectedIds, onToggleComplete]);

  const handleBatchDelete = useCallback(() => {
    Alert.alert(
      '批量删除',
      `确定要删除选中的 ${selectedIds.length} 个待办事项吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            selectedIds.forEach(id => onDelete(id));
            setSelectedIds([]);
            setIsSelectionMode(false);
          },
        },
      ]
    );
  }, [selectedIds, onDelete]);

  const renderItem = useCallback(({ item }: { item: Todo }) => (
    <TodoItem
      todo={item}
      onComplete={onToggleComplete}
      onDelete={onDelete}
      onSelect={isLongPressToSelectEnabled() ? handleSelect : undefined}
      isSelected={selectedIds.includes(item.id)}
      isSelectionMode={isSelectionMode}
    />
  ), [onToggleComplete, onDelete, handleSelect, selectedIds, isSelectionMode, isLongPressToSelectEnabled]);

  const renderSelectionToolbar = () => {
    if (!isSelectionMode) return null;

    return (
      <View style={[styles.toolbar, { backgroundColor: theme.colors.card }]}>
        <View style={styles.toolbarLeft}>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => {
              setSelectedIds([]);
              setIsSelectionMode(false);
            }}
          >
            <Icon name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.toolbarText, { color: theme.colors.text }]}>
            已选择 {selectedIds.length} 项
          </Text>
        </View>
        <View style={styles.toolbarRight}>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={handleBatchComplete}
          >
            <Icon name="check" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={handleBatchDelete}
          >
            <Icon name="delete" size={24} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderSelectionToolbar()}
      <FlatList
        data={todos}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onRefresh={onRefresh}
        refreshing={isRefreshing}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarText: {
    fontSize: 16,
    marginLeft: 16,
  },
});

export default TodoList; 