import React, { memo, useState } from 'react';
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
import { Tag } from '../types/todo';
import { useTag } from '../contexts/TagContext';

interface TagPickerProps {
  value?: string[];
  onChange: (tagIds: string[]) => void;
  visible: boolean;
  onClose: () => void;
  error?: string;
}

const TagPicker: React.FC<TagPickerProps> = ({
  value = [],
  onChange,
  visible,
  onClose,
  error,
}) => {
  const { tags, addTag } = useTag();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#2196F3');

  // 预定义的颜色选项
  const colorOptions = [
    '#2196F3', // 蓝色
    '#4CAF50', // 绿色
    '#FFC107', // 黄色
    '#F44336', // 红色
    '#9C27B0', // 紫色
    '#FF9800', // 橙色
    '#795548', // 棕色
    '#607D8B', // 蓝灰色
  ];

  // 获取选中的标签
  const selectedTags = tags.filter(tag => value.includes(tag.id));

  // 处理添加新标签
  const handleAddTag = async () => {
    if (!newTagName.trim()) return;

    try {
      await addTag(newTagName.trim(), newTagColor);
      setNewTagName('');
      setIsAddingNew(false);
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  // 处理标签选择
  const handleTagSelect = (tagId: string) => {
    const newValue = value.includes(tagId)
      ? value.filter(id => id !== tagId)
      : [...value, tagId];
    onChange(newValue);
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.container, error && styles.errorContainer]}
        onPress={() => onClose()}
      >
        {selectedTags.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagScroll}
          >
            {selectedTags.map(tag => (
              <View
                key={tag.id}
                style={[styles.tag, { backgroundColor: tag.color }]}
              >
                <Text style={styles.tagText}>{tag.name}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <>
            <MaterialIcons name="local-offer" size={24} color="#757575" />
            <Text style={styles.placeholder}>选择标签</Text>
          </>
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
              <Text style={styles.title}>选择标签</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <MaterialIcons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.tagList}>
              {tags.map(tag => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagItem,
                    value.includes(tag.id) && styles.selectedTagItem,
                  ]}
                  onPress={() => handleTagSelect(tag.id)}
                >
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: tag.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.tagText,
                      value.includes(tag.id) && styles.selectedTagText,
                    ]}
                  >
                    {tag.name}
                  </Text>
                  {value.includes(tag.id) && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color="#2196F3"
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {isAddingNew ? (
              <View style={styles.addNewContainer}>
                <TextInput
                  style={styles.input}
                  value={newTagName}
                  onChangeText={setNewTagName}
                  placeholder="输入标签名称"
                  placeholderTextColor="#9e9e9e"
                />
                <View style={styles.colorOptions}>
                  {colorOptions.map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        newTagColor === color && styles.selectedColorOption,
                      ]}
                      onPress={() => setNewTagColor(color)}
                    />
                  ))}
                </View>
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
                      !newTagName.trim() && styles.disabledButton,
                    ]}
                    onPress={handleAddTag}
                    disabled={!newTagName.trim()}
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
                <Text style={styles.addButtonText}>新建标签</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
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
  tagScroll: {
    flexGrow: 0,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  placeholder: {
    flex: 1,
    fontSize: 16,
    color: '#9e9e9e',
    marginLeft: 8,
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
  tagList: {
    maxHeight: 300,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  selectedTagItem: {
    backgroundColor: '#E3F2FD',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  selectedTagText: {
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
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
});

export default memo(TagPicker); 