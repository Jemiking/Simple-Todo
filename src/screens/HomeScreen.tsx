import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTodo } from '../contexts/TodoContext';
import DraggableTodoList from '../components/DraggableTodoList';
import TodoFilter, { FilterType } from '../components/TodoFilter';
import TodoSort, { SortType, SortOrder } from '../components/TodoSort';
import BatchOperations from '../components/BatchOperations';
import ScrollToTop from '../components/ScrollToTop';
import AdvancedFilter from '../components/AdvancedFilter';
import FilterService from '../services/FilterService';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    todos,
    isLoading,
    toggleTodoComplete,
    deleteTodo,
    reorderTodos,
    refreshTodos,
  } = useTodo();
  const listRef = useRef<FlatList>(null);

  // 过滤状态
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  // 排序状态
  const [currentSort, setCurrentSort] = useState<SortType>('createdAt');
  const [currentOrder, setCurrentOrder] = useState<SortOrder>('desc');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  // 批量操作状态
  const [batchMode, setBatchMode] = useState(false);
  // 刷新状态
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});

  // 过滤和排序后的Todo列表
  const filteredAndSortedTodos = useMemo(() => {
    // 先过滤
    let result = todos;
    switch (currentFilter) {
      case 'active':
        result = result.filter(todo => !todo.completed);
        break;
      case 'completed':
        result = result.filter(todo => todo.completed);
        break;
    }

    // 再排序
    return [...result].sort((a, b) => {
      let comparison = 0;
      switch (currentSort) {
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          comparison = a.dueDate.getTime() - b.dueDate.getTime();
          break;
        case 'priority':
          if (!a.priority) return 1;
          if (!b.priority) return -1;
          comparison = a.priority - b.priority;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return currentOrder === 'asc' ? comparison : -comparison;
    });
  }, [todos, currentFilter, currentSort, currentOrder]);

  // 计算未完成和已完成的数量
  const activeCount = useMemo(() => todos.filter(todo => !todo.completed).length, [todos]);
  const completedCount = useMemo(() => todos.filter(todo => todo.completed).length, [todos]);

  // 处理刷新
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshTodos();
    } catch (error) {
      console.error('Error refreshing todos:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshTodos]);

  // 处理编辑
  const handleEdit = useCallback((todo) => {
    navigation.navigate('EditTodo', { todoId: todo.id });
  }, [navigation]);

  // 处理添加
  const handleAdd = useCallback(() => {
    navigation.navigate('AddTodo');
  }, [navigation]);

  // 处理过滤变化
  const handleFilterChange = useCallback((filter: FilterType) => {
    setCurrentFilter(filter);
  }, []);

  // 处理排序变化
  const handleSortChange = useCallback((sort: SortType) => {
    setCurrentSort(sort);
  }, []);

  // 处理排序顺序变化
  const handleOrderChange = useCallback((order: SortOrder) => {
    setCurrentOrder(order);
  }, []);

  // 处理批量完成/取消完成
  const handleBatchToggleComplete = useCallback((ids: string[]) => {
    ids.forEach(id => toggleTodoComplete(id));
  }, [toggleTodoComplete]);

  // 处理批量删除
  const handleBatchDelete = useCallback((ids: string[]) => {
    ids.forEach(id => deleteTodo(id));
  }, [deleteTodo]);

  // 处理拖拽排序
  const handleDragEnd = useCallback((fromIndex: number, toIndex: number) => {
    reorderTodos(fromIndex, toIndex);
  }, [reorderTodos]);

  // 处理保存筛选条件
  const handleSaveFilter = useCallback(async (name: string, options: FilterOptions) => {
    try {
      await FilterService.saveFilter(name, options);
      Alert.alert('成功', '筛选条件保存成功');
    } catch (error) {
      console.error('Error saving filter:', error);
      Alert.alert('错误', '保存筛选条件失败');
    }
  }, []);

  // 筛选后的Todo列表
  const filteredTodos = useMemo(() => {
    return FilterService.filterTodos(todos, filterOptions);
  }, [todos, filterOptions]);

  return (
    <View style={styles.container}>
      {/* 过滤器 */}
      <View style={styles.header}>
        <TodoFilter
          currentFilter={currentFilter}
          onFilterChange={handleFilterChange}
          activeCount={activeCount}
          completedCount={completedCount}
        />
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortModalVisible(true)}
        >
          <MaterialIcons name="sort" size={24} color="#757575" />
        </TouchableOpacity>
      </View>

      {/* Todo列表 */}
      <DraggableTodoList
        ref={listRef}
        todos={filteredTodos}
        isLoading={isLoading || isRefreshing}
        onToggleComplete={toggleTodoComplete}
        onDelete={deleteTodo}
        onEdit={handleEdit}
        onRefresh={handleRefresh}
        onDragEnd={handleDragEnd}
        onAddNew={handleAdd}
      />

      <ScrollToTop scrollRef={listRef} />

      {/* 添加按钮 */}
      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* 排序模态框 */}
      <TodoSort
        currentSort={currentSort}
        currentOrder={currentOrder}
        onSortChange={handleSortChange}
        onOrderChange={handleOrderChange}
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
      />

      {/* 批量操作 */}
      <BatchOperations
        todos={filteredTodos}
        onToggleComplete={handleBatchToggleComplete}
        onDelete={handleBatchDelete}
        onBatchModeChange={setBatchMode}
      />

      <AdvancedFilter
        value={filterOptions}
        onChange={setFilterOptions}
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onSave={handleSaveFilter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  sortButton: {
    padding: 16,
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default HomeScreen; 