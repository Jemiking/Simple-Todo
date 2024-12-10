import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { useTag } from '../contexts/TagContext';
import { useTheme } from '../contexts/ThemeContext';
import { Tag } from '../types/tag';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ColorPicker from './ColorPicker';

interface TagSelectorProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  maxTags?: number;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTagIds,
  onTagsChange,
  maxTags = 5,
}) => {
  const { theme } = useTheme();
  const {
    tags,
    tagGroups,
    createTag,
    deleteTag,
    filterTags,
  } = useTag();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#2196F3');
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);

  useEffect(() => {
    updateFilteredTags();
  }, [tags, searchText]);

  const updateFilteredTags = async () => {
    try {
      const filtered = await filterTags(
        { searchText },
        { sortBy: 'name', sortDirection: 'asc' }
      );
      setFilteredTags(filtered);
    } catch (error) {
      console.error('过滤标签失败:', error);
    }
  };

  const handleTagPress = (tagId: string) => {
    const isSelected = selectedTagIds.includes(tagId);
    if (isSelected) {
      onTagsChange(selectedTagIds.filter(id => id !== tagId));
    } else if (selectedTagIds.length < maxTags) {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const newTag = await createTag({
        name: newTagName.trim(),
        color: selectedColor,
      });
      setNewTagName('');
      setSelectedColor('#2196F3');
      if (selectedTagIds.length < maxTags) {
        onTagsChange([...selectedTagIds, newTag.id]);
      }
    } catch (error) {
      console.error('创建标签失败:', error);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await deleteTag(tagId);
      onTagsChange(selectedTagIds.filter(id => id !== tagId));
    } catch (error) {
      console.error('删除���签失败:', error);
    }
  };

  const renderTag = (tag: Tag, isSelected: boolean) => (
    <TouchableOpacity
      key={tag.id}
      style={[
        styles.tag,
        { backgroundColor: tag.color + '20' },
        isSelected && styles.selectedTag,
      ]}
      onPress={() => handleTagPress(tag.id)}
    >
      <Text style={[styles.tagText, { color: tag.color }]}>{tag.name}</Text>
      {isSelected && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTag(tag.id)}
        >
          <Icon name="close" size={16} color={tag.color} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.selectedTagsContainer}
      >
        {selectedTagIds.map(tagId => {
          const tag = tags.find(t => t.id === tagId);
          if (tag) {
            return renderTag(tag, true);
          }
          return null;
        })}
        {selectedTagIds.length < maxTags && (
          <TouchableOpacity
            style={[styles.addButton, { borderColor: theme.colors.border }]}
            onPress={() => setIsModalVisible(true)}
          >
            <Icon name="add" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              选择标签
            </Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Icon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
            <Icon name="search" size={20} color={theme.colors.text} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="搜索标签..."
              placeholderTextColor={theme.colors.text + '80'}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <ScrollView style={styles.tagList}>
            {filteredTags.map(tag => renderTag(tag, selectedTagIds.includes(tag.id)))}
          </ScrollView>

          <View style={styles.createTagContainer}>
            <View style={[styles.createTagInput, { backgroundColor: theme.colors.card }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="新建标签..."
                placeholderTextColor={theme.colors.text + '80'}
                value={newTagName}
                onChangeText={setNewTagName}
              />
              <TouchableOpacity
                style={[styles.colorButton, { backgroundColor: selectedColor }]}
                onPress={() => setIsColorPickerVisible(true)}
              />
            </View>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleCreateTag}
            >
              <Text style={styles.createButtonText}>创建</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={isColorPickerVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsColorPickerVisible(false)}
        >
          <View style={styles.colorPickerModal}>
            <View style={[styles.colorPickerContainer, { backgroundColor: theme.colors.card }]}>
              <ColorPicker
                selectedColor={selectedColor}
                onColorSelect={(color) => {
                  setSelectedColor(color);
                  setIsColorPickerVisible(false);
                }}
              />
            </View>
          </View>
        </Modal>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedTag: {
    borderWidth: 1,
  },
  tagText: {
    fontSize: 14,
    marginRight: 4,
  },
  deleteButton: {
    padding: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  tagList: {
    flex: 1,
  },
  createTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  createTagInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  colorButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 8,
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  colorPickerModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerContainer: {
    padding: 16,
    borderRadius: 8,
    width: '80%',
  },
}); 