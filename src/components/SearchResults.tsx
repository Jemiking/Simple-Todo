import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Todo } from '../types/todo';
import { SearchService } from '../services/searchService';

interface SearchResultsProps {
  todo: Todo;
  query: string;
  onPress: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  todo,
  query,
  onPress,
}) => {
  // 高亮标题中的搜索结果
  const titleParts = SearchService.highlightSearchResults(todo.title, query);

  // 高亮描述中的搜索结果
  const descriptionParts = todo.description
    ? SearchService.highlightSearchResults(todo.description, query)
    : [];

  // 高亮子任务中的搜索结果
  const subTaskMatches = todo.subTasks
    .filter(subTask => subTask.title.toLowerCase().includes(query.toLowerCase()))
    .map(subTask => ({
      ...subTask,
      titleParts: SearchService.highlightSearchResults(subTask.title, query),
    }));

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
    >
      {/* 标题 */}
      <View style={styles.titleContainer}>
        {titleParts.map((part, index) => (
          <Text
            key={index}
            style={[
              styles.title,
              index % 2 === 1 && styles.highlight,
            ]}
          >
            {part}
          </Text>
        ))}
      </View>

      {/* 描述 */}
      {descriptionParts.length > 0 && (
        <View style={styles.descriptionContainer}>
          {descriptionParts.map((part, index) => (
            <Text
              key={index}
              style={[
                styles.description,
                index % 2 === 1 && styles.highlight,
              ]}
            >
              {part}
            </Text>
          ))}
        </View>
      )}

      {/* 子任务 */}
      {subTaskMatches.length > 0 && (
        <View style={styles.subTasksContainer}>
          {subTaskMatches.map(subTask => (
            <View
              key={subTask.id}
              style={styles.subTaskItem}
            >
              <Text style={styles.subTaskLabel}>子任务：</Text>
              {subTask.titleParts.map((part, index) => (
                <Text
                  key={index}
                  style={[
                    styles.subTaskTitle,
                    index % 2 === 1 && styles.highlight,
                  ]}
                >
                  {part}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  titleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    color: '#212121',
  },
  descriptionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#757575',
  },
  subTasksContainer: {
    marginTop: 8,
  },
  subTaskItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
  },
  subTaskLabel: {
    fontSize: 14,
    color: '#757575',
    marginRight: 4,
  },
  subTaskTitle: {
    fontSize: 14,
    color: '#757575',
  },
  highlight: {
    backgroundColor: '#FFF9C4',
    color: '#212121',
  },
});

export default memo(SearchResults); 