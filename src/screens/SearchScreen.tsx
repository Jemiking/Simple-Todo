import React, { memo, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTodo } from '../contexts/TodoContext';
import { TodoPriority } from '../types/todo';
import { SearchService, SearchOptions } from '../services/searchService';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import EmptyState from '../components/EmptyState';
import SearchHistory from '../components/SearchHistory';
import { SearchHistoryService } from '../services/searchHistoryService';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import QuickSearch from '../components/QuickSearch';
import { QuickSearchService } from '../services/quickSearchService';
import { FilterOptions } from '../types/filter';

const SearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const { todos } = useTodo();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(todos);
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<TodoPriority | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);

  // 处理搜索
  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setSearchResults(todos);
      return;
    }

    // 添加搜索历史
    await SearchHistoryService.addSearchHistory(query.trim());

    const options: SearchOptions = {
      query,
      includeCompleted,
      categoryId,
      tagIds,
      priority,
      startDate,
      endDate,
    };

    const results = SearchService.searchTodos(todos, options);
    setSearchResults(results);
    setShowSuggestions(false);
  }, [
    todos,
    query,
    includeCompleted,
    categoryId,
    tagIds,
    priority,
    startDate,
    endDate,
  ]);

  // 处理查询变化
  const handleQueryChange = useCallback(async (text: string) => {
    setQuery(text);
    if (text.trim()) {
      const suggestions = await SearchHistoryService.getSearchSuggestions(text.trim());
      setSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  // 处理建议选择
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch();
  }, [handleSearch]);

  // 处理快速搜索选择
  const handleQuickSearchSelect = useCallback((item: QuickSearchItem) => {
    setQuery('');
    setIncludeCompleted(item.filter.completed ?? true);
    setCategoryId(item.filter.categoryId);
    setTagIds(item.filter.tagIds ?? []);
    setPriority(item.filter.priority);
    setStartDate(item.filter.startDate);
    setEndDate(item.filter.endDate);

    const results = SearchService.searchTodos(todos, item.filter);
    setSearchResults(results);
  }, [todos]);

  // 处理保存快速搜索
  const handleSaveQuickSearch = useCallback(async (name: string, icon: string, filter: FilterOptions) => {
    try {
      await QuickSearchService.addQuickSearch(name, icon, {
        ...filter,
        completed: includeCompleted,
        categoryId,
        tagIds,
        priority,
        startDate,
        endDate,
      });
      Alert.alert('成功', '快速搜索保存成功');
    } catch (error) {
      console.error('Error saving quick search:', error);
      Alert.alert('错误', '保存快速搜索失败');
    }
  }, [
    includeCompleted,
    categoryId,
    tagIds,
    priority,
    startDate,
    endDate,
  ]);

  // 处理Todo项点击
  const handleTodoPress = useCallback((todoId: string) => {
    navigation.navigate('EditTodo', { todoId });
  }, [navigation]);

  // 渲染搜索结果项
  const renderItem = useCallback(({ item }) => (
    <SearchResults
      todo={item}
      query={query}
      onPress={() => handleTodoPress(item.id)}
    />
  ), [query, handleTodoPress]);

  // 渲染空状态
  const renderEmptyState = useCallback(() => (
    <EmptyState
      title={query ? '未找到相关待办事项' : '开始搜索待办事项'}
      description={query ? '尝试使用其他关键词或筛选条件' : '输入关键词或使用筛选条件搜索'}
      icon={query ? 'search-off' : 'search'}
    />
  ), [query]);

  return (
    <View style={styles.container}>
      <SearchBar
        value={query}
        onChangeText={handleQueryChange}
        onSearch={handleSearch}
        includeCompleted={includeCompleted}
        onIncludeCompletedChange={setIncludeCompleted}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        tagIds={tagIds}
        onTagsChange={setTagIds}
        priority={priority}
        onPriorityChange={setPriority}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
      />

      {showSuggestions && suggestions.length > 0 ? (
        <View style={styles.suggestionsContainer}>
          {suggestions.map(suggestion => (
            <TouchableOpacity
              key={suggestion}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionSelect(suggestion)}
            >
              <MaterialIcons name="search" size={20} color="#757575" />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : query ? (
        <>
          {searchResults.length > 0 && (
            <Text style={styles.resultCount}>
              找到 {searchResults.length} 个相关待办事项
            </Text>
          )}

          <FlatList
            data={searchResults}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState()}
          />
        </>
      ) : (
        <ScrollView>
          <QuickSearch
            onSelect={handleQuickSearchSelect}
            onSave={handleSaveQuickSearch}
          />
          <SearchHistory onSelect={handleSuggestionSelect} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  listContent: {
    flexGrow: 1,
  },
  resultCount: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  suggestionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#212121',
  },
});

export default memo(SearchScreen); 