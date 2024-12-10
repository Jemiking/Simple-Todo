import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Category } from '../types/todo';
import { useCategory } from '../contexts/CategoryContext';
import ColorPicker from './ColorPicker';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { ScaleDecorator } from 'react-native-draggable-flatlist';

interface CategoryPickerProps {
  value?: string;
  onChange: (categoryId: string | undefined) => void;
  visible: boolean;
  onClose: () => void;
  error?: string;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({
  value,
  onChange,
  visible,
  onClose,
  error,
}) => {
  const { categories, addCategory, reorderCategories } = useCategory();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#2196F3');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // 获取当前选中的分类
  const selectedCategory = categories.find(category => category.id === value);

  // 处理添加新分类
  const handleAddCategory = useCallback(async () => {
    if (!newCategoryName.trim()) return;

    try {
      await addCategory(newCategoryName.trim(), newCategoryColor);
      setNewCategoryName('');
      setIsAddingNew(false);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  }, [newCategoryName, newCategoryColor, addCategory]);

  // 处理拖拽结束
  const handleDragEnd = useCallback(({ from, to }) => {
    reorderCategories(from, to);
  }, [reorderCategories]);

  return (
    <View>
      <TouchableOpacity
        style={[styles.container, error && styles.errorContainer]}
        onPress={() => onClose()}
      >
        {selectedCategory ? (
          <>
            <View
              style={[
                styles.colorDot,
                { backgroundColor: selectedCategory.color },
              ]}
            />
            <Text style={styles.text}>{selectedCategory.name}</Text>
          </>
        ) : (
          <>
            <MaterialIcons name="folder" size={24} color="#757575" />
            <Text style={styles.placeholder}>选择分类</Text>
          </>
        )}
        {selectedCategory && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => onChange(undefined)}
          >
            <MaterialIcons name="close" size={20} color="#757575" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>选择分类</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <MaterialIcons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            <DraggableFlatList
              data={categories}
              renderItem={({ item, drag, isActive }) => (
                <ScaleDecorator>
                  <TouchableOpacity
                    style={[
                      styles.categoryItem,
                      value === item.id && styles.selectedCategoryItem,
                      isActive && styles.activeCategoryItem,
                    ]}
                    onPress={() => {
                      onChange(item.id);
                      onClose();
                    }}
                    onLongPress={drag}
                  >
                    <View style={styles.categoryContent}>
                      <MaterialIcons
                        name="drag-handle"
                        size={20}
                        color="#bdbdbd"
                        style={styles.dragHandle}
                      />
                      <View
                        style={[
                          styles.colorDot,
                          { backgroundColor: item.color },
                        ]}
                      />
                      <Text
                        style={[
                          styles.categoryText,
                          value === item.id && styles.selectedCategoryText,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </View>
                    {value === item.id && (
                      <MaterialIcons
                        name="check"
                        size={20}
                        color="#2196F3"
                        style={styles.checkIcon}
                      />
                    )}
                  </TouchableOpacity>
                </ScaleDecorator>
              )}
              keyExtractor={item => item.id}
              onDragEnd={handleDragEnd}
            />

            {isAddingNew ? (
              <View style={styles.addNewContainer}>
                <TextInput
                  style={styles.input}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="输入分类名称"
                  placeholderTextColor="#9e9e9e"
                />
                <TouchableOpacity
                  style={[
                    styles.colorButton,
                    { backgroundColor: newCategoryColor },
                  ]}
                  onPress={() => setShowColorPicker(true)}
                >
                  <MaterialIcons name="color-lens" size={20} color="white" />
                </TouchableOpacity>
                <View style={styles.addNewActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => setIsAddingNew(false)}
                  >
                    <Text style={styles.cancelButtonText}>取消</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.confirmButton,
                      !newCategoryName.trim() && styles.disabledButton,
                    ]}
                    onPress={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                  >
                    <Text style={styles.confirmButtonText}>确定</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setIsAddingNew(true)}
              >
                <MaterialIcons name="add" size={24} color="#2196F3" />
                <Text style={styles.addButtonText}>新建分类</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      <ColorPicker
        value={newCategoryColor}
        onChange={setNewCategoryColor}
        visible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  errorContainer: {
    borderColor: '#f44336',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
  },
  placeholder: {
    flex: 1,
    fontSize: 16,
    color: '#9e9e9e',
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
    color: '#f44336',
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
  categoryList: {
    maxHeight: 300,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  selectedCategoryItem: {
    backgroundColor: '#E3F2FD',
  },
  categoryText: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
  },
  selectedCategoryText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 8,
  },
  addNewContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212121',
    marginBottom: 16,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 16,
  },
  addNewActions: {
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
  categoryContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dragHandle: {
    marginRight: 8,
  },
  activeCategoryItem: {
    backgroundColor: '#E3F2FD',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default memo(CategoryPicker); 