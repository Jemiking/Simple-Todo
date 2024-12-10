import React, { memo, useCallback, forwardRef } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  FlatList,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Todo } from '../types/todo';
import TodoItem from './TodoItem';
import EmptyState from './EmptyState';

interface DraggableTodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onRefresh: () => void;
  onDragEnd: (fromIndex: number, toIndex: number) => void;
  onAddNew?: () => void;
}

const DraggableTodoList = forwardRef<FlatList, DraggableTodoListProps>(({
  todos,
  isLoading,
  onToggleComplete,
  onDelete,
  onEdit,
  onRefresh,
  onDragEnd,
  onAddNew,
}, ref) => {
  // 渲染Todo项
  const renderItem = useCallback(({
    item,
    drag,
    isActive,
  }: RenderItemParams<Todo>) => {
    return (
      <ScaleDecorator>
        <View
          style={[
            styles.itemContainer,
            isActive && styles.activeItemContainer,
          ]}
        >
          <TodoItem
            todo={item}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
            onEdit={onEdit}
            onLongPress={drag}
          />
        </View>
      </ScaleDecorator>
    );
  }, [onToggleComplete, onDelete, onEdit]);

  // 处理拖拽结束
  const handleDragEnd = useCallback(({ from, to }) => {
    onDragEnd(from, to);
  }, [onDragEnd]);

  // 渲染空状态
  const renderEmptyState = useCallback(() => (
    <EmptyState
      title="暂无待办事项"
      description="点击下方按钮创建新的待办事项"
      icon="playlist-add"
      actionText={onAddNew ? "创建待办" : undefined}
      onAction={onAddNew}
    />
  ), [onAddNew]);

  return (
    <DraggableFlatList
      ref={ref}
      data={todos}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      onDragEnd={handleDragEnd}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          colors={['#2196F3']}
          tintColor="#2196F3"
        />
      }
      contentContainerStyle={[
        styles.listContent,
        todos.length === 0 && styles.emptyContent,
      ]}
      style={styles.list}
      ListEmptyComponent={renderEmptyState}
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  );
});

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  emptyContent: {
    flex: 1,
  },
  itemContainer: {
    backgroundColor: 'white',
  },
  activeItemContainer: {
    backgroundColor: '#E3F2FD',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default memo(DraggableTodoList); 