import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTodo } from '../contexts/TodoContext';
import { IdGenerator } from '../utils/idGenerator';
import CustomInput from '../components/CustomInput';
import { Validator } from '../utils/validator';
import { TodoPriority } from '../types/todo';
import SubTaskList from '../components/SubTaskList';

const AddTodoScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addTodo } = useTodo();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<TodoPriority | undefined>(undefined);
  const [repeat, setRepeat] = useState<RepeatConfig | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

  // 处理保存
  const handleSave = async () => {
    const newTodo = {
      title,
      description,
      dueDate,
      priority,
      repeat,
      categoryId,
      tagIds,
      subTasks,
      completed: false,
    };

    // 验证数据
    const validationErrors = Validator.validateTodo(newTodo);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await addTodo({
        ...newTodo,
        id: IdGenerator.generateUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error adding todo:', error);
      setErrors({ submit: ['保存失败，请重试'] });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* 标题输入 */}
          <CustomInput
            value={title}
            onChangeText={setTitle}
            placeholder="输入待办事项标题"
            multiline={false}
          />
          {errors.title && (
            <View style={styles.errorContainer}>
              {errors.title.map((error, index) => (
                <Text key={index} style={styles.errorText}>{error}</Text>
              ))}
            </View>
          )}

          {/* 描述���入 */}
          <CustomInput
            value={description}
            onChangeText={setDescription}
            placeholder="添加描述（可选）"
            isDescription
            error={errors.description?.join('\n')}
          />

          {/* 截止日期选择 */}
          <CustomInput
            value={title}
            onChangeText={setTitle}
            dueDate={dueDate}
            onDueDateChange={setDueDate}
          />
          {errors.dueDate && (
            <View style={styles.errorContainer}>
              {errors.dueDate.map((error, index) => (
                <Text key={index} style={styles.errorText}>{error}</Text>
              ))}
            </View>
          )}

          {/* 优先级选择 */}
          <CustomInput
            value={title}
            onChangeText={setTitle}
            priority={priority}
            onPriorityChange={setPriority}
          />
          {errors.priority && (
            <View style={styles.errorContainer}>
              {errors.priority.map((error, index) => (
                <Text key={index} style={styles.errorText}>{error}</Text>
              ))}
            </View>
          )}

          {/* 重复设置 */}
          <CustomInput
            value={title}
            onChangeText={setTitle}
            repeat={repeat}
            onRepeatChange={setRepeat}
          />

          {/* 分类选择 */}
          <CustomInput
            value={title}
            onChangeText={setTitle}
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
          />

          {/* 标签选择 */}
          <CustomInput
            value={title}
            onChangeText={setTitle}
            tagIds={tagIds}
            onTagsChange={setTagIds}
          />

          {/* 子任务列表 */}
          <SubTaskList
            subTasks={subTasks}
            onSubTasksChange={setSubTasks}
          />
        </View>
      </ScrollView>

      {/* 保存按钮 */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <MaterialIcons name="check" size={24} color="white" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  saveButton: {
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
  errorContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
  },
});

export default AddTodoScreen; 