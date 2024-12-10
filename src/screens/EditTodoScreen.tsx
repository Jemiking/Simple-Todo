import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useTodo } from '../contexts/TodoContext';
import { Todo, TodoPriority } from '../types/todo';
import DatePicker from '../components/DatePicker';
import PriorityPicker from '../components/PriorityPicker';
import SubTaskList from '../components/SubTaskList';
import RepeatPicker from '../components/RepeatPicker';
import CategoryPicker from '../components/CategoryPicker';
import TagSelector from '../components/TagSelector';
import { Text } from 'react-native';
import AttachmentList from '../components/AttachmentList';
import ReminderSettings from '../components/ReminderSettings';

const EditTodoScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { updateTodo, deleteTodo } = useTodo();
  const todo = (route.params as { todo: Todo }).todo;

  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(todo.dueDate);
  const [priority, setPriority] = useState<TodoPriority | undefined>(todo.priority);
  const [subTasks, setSubTasks] = useState(todo.subTasks);
  const [repeat, setRepeat] = useState(todo.repeat);
  const [categoryId, setCategoryId] = useState<string | undefined>(todo.categoryId);
  const [tagIds, setTagIds] = useState<string[]>(todo.tagIds || []);
  const [attachmentIds, setAttachmentIds] = useState<string[]>(todo.attachmentIds || []);
  const [reminderId, setReminderId] = useState<string | undefined>(todo.reminderId);
  const [reminderTime, setReminderTime] = useState<Date | undefined>(todo.reminderTime);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('错误', '标题不能为空');
      return;
    }

    try {
      const updatedTodo: Todo = {
        ...todo,
        title: title.trim(),
        description: description.trim(),
        dueDate,
        priority,
        subTasks,
        repeat,
        categoryId,
        tagIds,
        attachmentIds,
        reminderId,
        reminderTime,
        updatedAt: new Date(),
      };

      await updateTodo(updatedTodo);
      navigation.goBack();
    } catch (error) {
      console.error('更新待办失败:', error);
      Alert.alert('错误', '更新待办失败');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      '删除待办',
      '确定要删除这个待办吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTodo(todo.id);
              navigation.goBack();
            } catch (error) {
              console.error('删除待办失败:', error);
              Alert.alert('错误', '删除待办失败');
            }
          },
        },
      ]
    );
  };

  const handleAttachmentAdded = (attachment: Attachment) => {
    setAttachmentIds(prev => [...prev, attachment.id]);
  };

  const handleAttachmentDeleted = (attachmentId: string) => {
    setAttachmentIds(prev => prev.filter(id => id !== attachmentId));
  };

  const handleReminderAdded = (reminder: ReminderConfig) => {
    setTodo(prev => ({
      ...prev,
      reminderId: reminder.id,
      reminderTime: reminder.time,
    }));
  };

  const handleReminderUpdated = (reminder: ReminderConfig) => {
    setTodo(prev => ({
      ...prev,
      reminderTime: reminder.time,
    }));
  };

  const handleReminderDeleted = () => {
    setTodo(prev => ({
      ...prev,
      reminderId: undefined,
      reminderTime: undefined,
    }));
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleDelete}>
          <Text style={{ color: theme.colors.error, fontSize: 16 }}>删除</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.section}>
        <TextInput
          style={[styles.titleInput, { color: theme.colors.text }]}
          placeholder="标题"
          placeholderTextColor={theme.colors.text + '80'}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.section}>
        <TextInput
          style={[styles.descriptionInput, { color: theme.colors.text }]}
          placeholder="描述"
          placeholderTextColor={theme.colors.text + '80'}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.section}>
        <DatePicker
          label="截止日期"
          value={dueDate}
          onChange={setDueDate}
        />
      </View>

      <View style={styles.section}>
        <PriorityPicker
          value={priority}
          onChange={setPriority}
        />
      </View>

      <View style={styles.section}>
        <SubTaskList
          subTasks={subTasks}
          onChange={setSubTasks}
        />
      </View>

      <View style={styles.section}>
        <RepeatPicker
          value={repeat}
          onChange={setRepeat}
        />
      </View>

      <View style={styles.section}>
        <CategoryPicker
          value={categoryId}
          onChange={setCategoryId}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>标签</Text>
        <TagSelector
          selectedTagIds={tagIds}
          onTagsChange={setTagIds}
        />
      </View>

      <View style={styles.section}>
        <AttachmentList
          todoId={todo.id}
          onAttachmentAdded={handleAttachmentAdded}
          onAttachmentDeleted={handleAttachmentDeleted}
        />
      </View>

      <View style={styles.section}>
        <ReminderSettings
          todoId={todo.id}
          onReminderAdded={handleReminderAdded}
          onReminderUpdated={handleReminderUpdated}
          onReminderDeleted={handleReminderDeleted}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>保存</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  descriptionInput: {
    fontSize: 16,
    textAlignVertical: 'top',
  },
  saveButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EditTodoScreen; 