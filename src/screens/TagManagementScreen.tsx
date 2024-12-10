import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useTag } from '../contexts/TagContext';
import { useTheme } from '../contexts/ThemeContext';
import { Tag, TagGroup } from '../types/tag';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ColorPicker from '../components/ColorPicker';

const TagManagementScreen: React.FC = () => {
  const { theme } = useTheme();
  const {
    tags,
    tagGroups,
    createTag,
    updateTag,
    deleteTag,
    createTagGroup,
    updateTagGroup,
    deleteTagGroup,
    addTagToGroup,
    removeTagFromGroup,
  } = useTag();

  const [selectedGroup, setSelectedGroup] = useState<TagGroup | null>(null);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#2196F3');
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const newTag = await createTag({
        name: newTagName.trim(),
        color: selectedColor,
      });

      if (selectedGroup) {
        await addTagToGroup(newTag.id, selectedGroup.id);
      }

      setNewTagName('');
      setSelectedColor('#2196F3');
      setIsAddingTag(false);
    } catch (error) {
      console.error('创建标签失败:', error);
      Alert.alert('错误', '创建标签失败');
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      await createTagGroup({
        name: newGroupName.trim(),
        tags: [],
      });
      setNewGroupName('');
      setIsAddingGroup(false);
    } catch (error) {
      console.error('创建标签组失败:', error);
      Alert.alert('错误', '创建标签组失败');
    }
  };

  const handleDeleteTag = async (tag: Tag) => {
    Alert.alert(
      '删除标签',
      `确定要删除标签"${tag.name}"吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTag(tag.id);
            } catch (error) {
              console.error('删除标签失败:', error);
              Alert.alert('错误', '删除标签失败');
            }
          },
        },
      ]
    );
  };

  const handleDeleteGroup = async (group: TagGroup) => {
    Alert.alert(
      '删除标签组',
      `确定要删除标签组"${group.name}"吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTagGroup(group.id);
              if (selectedGroup?.id === group.id) {
                setSelectedGroup(null);
              }
            } catch (error) {
              console.error('删除标签组失败:', error);
              Alert.alert('错误', '删除标签组失败');
            }
          },
        },
      ]
    );
  };

  const renderTag = (tag: Tag) => (
    <View
      key={tag.id}
      style={[
        styles.tag,
        { backgroundColor: tag.color + '20' },
      ]}
    >
      <Text style={[styles.tagText, { color: tag.color }]}>{tag.name}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteTag(tag)}
      >
        <Icon name="close" size={16} color={tag.color} />
      </TouchableOpacity>
    </View>
  );

  const renderGroup = (group: TagGroup) => (
    <TouchableOpacity
      key={group.id}
      style={[
        styles.group,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderWidth: selectedGroup?.id === group.id ? 2 : 1,
        },
      ]}
      onPress={() => setSelectedGroup(group)}
    >
      <View style={styles.groupHeader}>
        <Text style={[styles.groupName, { color: theme.colors.text }]}>
          {group.name}
        </Text>
        <TouchableOpacity onPress={() => handleDeleteGroup(group)}>
          <Icon name="delete" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.groupTags}>
        {group.tags.map(tag => renderTag(tag))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              标签组
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { borderColor: theme.colors.border }]}
              onPress={() => setIsAddingGroup(true)}
            >
              <Icon name="add" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {isAddingGroup && (
            <View style={styles.addForm}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.card,
                  },
                ]}
                placeholder="输入标签组名称..."
                placeholderTextColor={theme.colors.text + '80'}
                value={newGroupName}
                onChangeText={setNewGroupName}
              />
              <TouchableOpacity
                style={[
                  styles.createButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleCreateGroup}
              >
                <Text style={styles.createButtonText}>创建</Text>
              </TouchableOpacity>
            </View>
          )}
          {tagGroups.map(group => renderGroup(group))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {selectedGroup ? `${selectedGroup.name}的标签` : '所有标签'}
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { borderColor: theme.colors.border }]}
              onPress={() => setIsAddingTag(true)}
            >
              <Icon name="add" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {isAddingTag && (
            <View style={styles.addForm}>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.colors.card,
                    },
                  ]}
                  placeholder="输入标签名称..."
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
                style={[
                  styles.createButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleCreateTag}
              >
                <Text style={styles.createButtonText}>创建</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.tagList}>
            {(selectedGroup ? selectedGroup.tags : tags).map(tag => renderTag(tag))}
          </View>
        </View>
      </ScrollView>

      {isColorPickerVisible && (
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addForm: {
    marginBottom: 16,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  createButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  group: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '500',
  },
  groupTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  tagText: {
    fontSize: 14,
    marginRight: 4,
  },
  deleteButton: {
    padding: 2,
  },
  colorPickerModal: {
    ...StyleSheet.absoluteFillObject,
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