import React, { memo, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Text,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TodoPriority } from '../types/todo';
import { useCategory } from '../contexts/CategoryContext';
import { useTag } from '../contexts/TagContext';
import DatePicker from './DatePicker';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
  includeCompleted: boolean;
  onIncludeCompletedChange: (value: boolean) => void;
  categoryId?: string;
  onCategoryChange: (categoryId: string | undefined) => void;
  tagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  priority?: TodoPriority;
  onPriorityChange: (priority: TodoPriority | undefined) => void;
  startDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  endDate?: Date;
  onEndDateChange: (date: Date | undefined) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSearch,
  includeCompleted,
  onIncludeCompletedChange,
  categoryId,
  onCategoryChange,
  tagIds,
  onTagsChange,
  priority,
  onPriorityChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}) => {
  const { categories } = useCategory();
  const { tags } = useTag();
  const [showFilters, setShowFilters] = useState(false);

  // 获取选中的分类
  const selectedCategory = categories.find(category => category.id === categoryId);

  // 获取选中的标签
  const selectedTags = tags.filter(tag => tagIds.includes(tag.id));

  // 处理标签选择
  const handleTagSelect = (tagId: string) => {
    const newTagIds = tagIds.includes(tagId)
      ? tagIds.filter(id => id !== tagId)
      : [...tagIds, tagId];
    onTagsChange(newTagIds);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={24} color="#757575" />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="搜索待办事项"
          placeholderTextColor="#9e9e9e"
          returnKeyType="search"
          onSubmitEditing={onSearch}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <MaterialIcons name="filter-list" size={24} color="#757575" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>搜索筛选</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowFilters(false)}
              >
                <MaterialIcons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterList}>
              {/* 包含已完成 */}
              <TouchableOpacity
                style={styles.filterItem}
                onPress={() => onIncludeCompletedChange(!includeCompleted)}
              >
                <Text style={styles.filterLabel}>包含已完成</Text>
                <MaterialIcons
                  name={includeCompleted ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color="#2196F3"
                />
              </TouchableOpacity>

              {/* 分类选择 */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>分类</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryList}
                >
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      !categoryId && styles.selectedCategoryChip,
                    ]}
                    onPress={() => onCategoryChange(undefined)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        !categoryId && styles.selectedCategoryChipText,
                      ]}
                    >
                      全部
                    </Text>
                  </TouchableOpacity>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        categoryId === category.id && styles.selectedCategoryChip,
                      ]}
                      onPress={() => onCategoryChange(category.id)}
                    >
                      <View
                        style={[
                          styles.colorDot,
                          { backgroundColor: category.color },
                        ]}
                      />
                      <Text
                        style={[
                          styles.categoryChipText,
                          categoryId === category.id && styles.selectedCategoryChipText,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* 标签选择 */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>标签</Text>
                <View style={styles.tagGrid}>
                  {tags.map(tag => (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.tagChip,
                        { backgroundColor: tag.color },
                        tagIds.includes(tag.id) && styles.selectedTagChip,
                      ]}
                      onPress={() => handleTagSelect(tag.id)}
                    >
                      <Text style={styles.tagChipText}>{tag.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 优先级选择 */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>优先级</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.priorityList}
                >
                  <TouchableOpacity
                    style={[
                      styles.priorityChip,
                      !priority && styles.selectedPriorityChip,
                    ]}
                    onPress={() => onPriorityChange(undefined)}
                  >
                    <Text
                      style={[
                        styles.priorityChipText,
                        !priority && styles.selectedPriorityChipText,
                      ]}
                    >
                      全部
                    </Text>
                  </TouchableOpacity>
                  {Object.values(TodoPriority).filter(p => typeof p === 'number').map(p => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityChip,
                        priority === p && styles.selectedPriorityChip,
                      ]}
                      onPress={() => onPriorityChange(p as TodoPriority)}
                    >
                      <Text
                        style={[
                          styles.priorityChipText,
                          priority === p && styles.selectedPriorityChipText,
                        ]}
                      >
                        {p === TodoPriority.High ? '高' :
                          p === TodoPriority.Medium ? '中' : '低'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* 日期范围选择 */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>日期范围</Text>
                <View style={styles.dateRange}>
                  <View style={styles.dateInput}>
                    <Text style={styles.dateLabel}>开始日期</Text>
                    <DatePicker
                      value={startDate}
                      onChange={onStartDateChange}
                    />
                  </View>
                  <View style={styles.dateInput}>
                    <Text style={styles.dateLabel}>结束日期</Text>
                    <DatePicker
                      value={endDate}
                      onChange={onEndDateChange}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                setShowFilters(false);
                onSearch();
              }}
            >
              <Text style={styles.applyButtonText}>应用筛选</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#212121',
    marginLeft: 8,
  },
  filterButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#212121',
  },
  closeButton: {
    padding: 4,
  },
  filterList: {
    maxHeight: 500,
  },
  filterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterLabel: {
    fontSize: 16,
    color: '#212121',
  },
  filterSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 12,
  },
  categoryList: {
    flexGrow: 0,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#E3F2FD',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#757575',
  },
  selectedCategoryChipText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedTagChip: {
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tagChipText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  priorityList: {
    flexGrow: 0,
  },
  priorityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  selectedPriorityChip: {
    backgroundColor: '#E3F2FD',
  },
  priorityChipText: {
    fontSize: 14,
    color: '#757575',
  },
  selectedPriorityChipText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  dateRange: {
    flexDirection: 'row',
    gap: 16,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  applyButton: {
    margin: 16,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default memo(SearchBar); 