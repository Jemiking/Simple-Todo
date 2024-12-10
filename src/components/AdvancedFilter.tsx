import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FilterOptions } from '../services/filterService';
import { TodoPriority } from '../types/todo';
import { useCategory } from '../contexts/CategoryContext';
import { useTag } from '../contexts/TagContext';
import DatePicker from './DatePicker';
import AnimatedView from './AnimatedView';

interface AdvancedFilterProps {
  value: FilterOptions;
  onChange: (options: FilterOptions) => void;
  visible: boolean;
  onClose: () => void;
  onSave?: (name: string, options: FilterOptions) => void;
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  value,
  onChange,
  visible,
  onClose,
  onSave,
}) => {
  const { categories } = useCategory();
  const { tags } = useTag();
  const [isSaving, setIsSaving] = useState(false);
  const [filterName, setFilterName] = useState('');

  // 处理保存筛选条件
  const handleSave = useCallback(() => {
    if (!filterName.trim() || !onSave) return;
    onSave(filterName.trim(), value);
    setFilterName('');
    setIsSaving(false);
  }, [filterName, value, onSave]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>高级筛选</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <MaterialIcons name="close" size={24} color="#757575" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterList}>
            {/* 完成状态 */}
            <AnimatedView
              animation="fade"
              delay={0}
              style={styles.filterSection}
            >
              <Text style={styles.sectionTitle}>完成状态</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>仅显示已完成</Text>
                <Switch
                  value={value.completed}
                  onValueChange={completed => onChange({ ...value, completed })}
                />
              </View>
            </AnimatedView>

            {/* 分类 */}
            <AnimatedView
              animation="fade"
              delay={100}
              style={styles.filterSection}
            >
              <Text style={styles.sectionTitle}>分类</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                <TouchableOpacity
                  style={[
                    styles.chip,
                    !value.categoryId && styles.selectedChip,
                  ]}
                  onPress={() => onChange({ ...value, categoryId: undefined })}
                >
                  <Text
                    style={[
                      styles.chipText,
                      !value.categoryId && styles.selectedChipText,
                    ]}
                  >
                    全部
                  </Text>
                </TouchableOpacity>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.chip,
                      value.categoryId === category.id && styles.selectedChip,
                    ]}
                    onPress={() => onChange({ ...value, categoryId: category.id })}
                  >
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: category.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        value.categoryId === category.id && styles.selectedChipText,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </AnimatedView>

            {/* 标签 */}
            <AnimatedView
              animation="fade"
              delay={200}
              style={styles.filterSection}
            >
              <Text style={styles.sectionTitle}>标签</Text>
              <View style={styles.tagGrid}>
                {tags.map(tag => (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      styles.tagChip,
                      { backgroundColor: tag.color },
                      value.tagIds?.includes(tag.id) && styles.selectedTagChip,
                    ]}
                    onPress={() => {
                      const tagIds = value.tagIds || [];
                      const newTagIds = tagIds.includes(tag.id)
                        ? tagIds.filter(id => id !== tag.id)
                        : [...tagIds, tag.id];
                      onChange({ ...value, tagIds: newTagIds });
                    }}
                  >
                    <Text style={styles.tagChipText}>{tag.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </AnimatedView>

            {/* 优先级 */}
            <AnimatedView
              animation="fade"
              delay={300}
              style={styles.filterSection}
            >
              <Text style={styles.sectionTitle}>优先级</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                <TouchableOpacity
                  style={[
                    styles.chip,
                    value.priority === undefined && styles.selectedChip,
                  ]}
                  onPress={() => onChange({ ...value, priority: undefined })}
                >
                  <Text
                    style={[
                      styles.chipText,
                      value.priority === undefined && styles.selectedChipText,
                    ]}
                  >
                    全部
                  </Text>
                </TouchableOpacity>
                {Object.values(TodoPriority).filter(p => typeof p === 'number').map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.chip,
                      value.priority === p && styles.selectedChip,
                    ]}
                    onPress={() => onChange({ ...value, priority: p as TodoPriority })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        value.priority === p && styles.selectedChipText,
                      ]}
                    >
                      {p === TodoPriority.High ? '高' :
                        p === TodoPriority.Medium ? '中' : '低'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </AnimatedView>

            {/* 日期范围 */}
            <AnimatedView
              animation="fade"
              delay={400}
              style={styles.filterSection}
            >
              <Text style={styles.sectionTitle}>日期范围</Text>
              <View style={styles.dateRange}>
                <View style={styles.dateInput}>
                  <Text style={styles.dateLabel}>开始日期</Text>
                  <DatePicker
                    value={value.startDate}
                    onChange={startDate => onChange({ ...value, startDate })}
                  />
                </View>
                <View style={styles.dateInput}>
                  <Text style={styles.dateLabel}>结束日期</Text>
                  <DatePicker
                    value={value.endDate}
                    onChange={endDate => onChange({ ...value, endDate })}
                  />
                </View>
              </View>
            </AnimatedView>

            {/* 其他条件 */}
            <AnimatedView
              animation="fade"
              delay={500}
              style={styles.filterSection}
            >
              <Text style={styles.sectionTitle}>其他条件</Text>
              <View style={styles.switchGroup}>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>有描述</Text>
                  <Switch
                    value={value.hasDescription}
                    onValueChange={hasDescription => onChange({ ...value, hasDescription })}
                  />
                </View>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>有子任务</Text>
                  <Switch
                    value={value.hasSubTasks}
                    onValueChange={hasSubTasks => onChange({ ...value, hasSubTasks })}
                  />
                </View>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>重复任务</Text>
                  <Switch
                    value={value.hasRepeat}
                    onValueChange={hasRepeat => onChange({ ...value, hasRepeat })}
                  />
                </View>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>有截止日期</Text>
                  <Switch
                    value={value.hasDueDate}
                    onValueChange={hasDueDate => onChange({ ...value, hasDueDate })}
                  />
                </View>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>已逾期</Text>
                  <Switch
                    value={value.isOverdue}
                    onValueChange={isOverdue => onChange({ ...value, isOverdue })}
                  />
                </View>
              </View>
            </AnimatedView>

            {/* 保存筛选条件 */}
            {onSave && (
              <AnimatedView
                animation="fade"
                delay={600}
                style={styles.filterSection}
              >
                <Text style={styles.sectionTitle}>保存筛选条件</Text>
                {isSaving ? (
                  <View style={styles.saveContainer}>
                    <TextInput
                      style={styles.input}
                      value={filterName}
                      onChangeText={setFilterName}
                      placeholder="输入筛选条件名称"
                      placeholderTextColor="#9e9e9e"
                    />
                    <View style={styles.saveActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => setIsSaving(false)}
                      >
                        <Text style={styles.cancelButtonText}>取消</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          styles.confirmButton,
                          !filterName.trim() && styles.disabledButton,
                        ]}
                        onPress={handleSave}
                        disabled={!filterName.trim()}
                      >
                        <Text style={styles.confirmButtonText}>保存</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => setIsSaving(true)}
                  >
                    <MaterialIcons name="save" size={24} color="#2196F3" />
                    <Text style={styles.saveButtonText}>保存当前筛选条件</Text>
                  </TouchableOpacity>
                )}
              </AnimatedView>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  filterSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#212121',
  },
  chipScroll: {
    flexGrow: 0,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: '#E3F2FD',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  chipText: {
    fontSize: 14,
    color: '#757575',
  },
  selectedChipText: {
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
  switchGroup: {
    gap: 8,
  },
  saveContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212121',
  },
  saveActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelButtonText: {
    color: '#757575',
    fontSize: 14,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  saveButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
});

export default memo(AdvancedFilter); 