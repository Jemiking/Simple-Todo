import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SubTask } from '../types/todo';
import { IdGenerator } from '../utils/idGenerator';

interface SubTaskListProps {
  subTasks: SubTask[];
  onSubTasksChange: (subTasks: SubTask[]) => void;
}

const SubTaskList: React.FC<SubTaskListProps> = ({
  subTasks,
  onSubTasksChange,
}) => {
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

  // 处理添加子任务
  const handleAddSubTask = useCallback(() => {
    if (!newSubTaskTitle.trim()) return;

    const newSubTask: SubTask = {
      id: IdGenerator.generateUUID(),
      title: newSubTaskTitle.trim(),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onSubTasksChange([...subTasks, newSubTask]);
    setNewSubTaskTitle('');
  }, [newSubTaskTitle, subTasks, onSubTasksChange]);

  // 处理切换完成状态
  const handleToggleComplete = useCallback((id: string) => {
    const updatedSubTasks = subTasks.map(subTask =>
      subTask.id === id
        ? {
            ...subTask,
            completed: !subTask.completed,
            updatedAt: new Date(),
          }
        : subTask
    );
    onSubTasksChange(updatedSubTasks);
  }, [subTasks, onSubTasksChange]);

  // 处理删除子任务
  const handleDelete = useCallback((id: string) => {
    const updatedSubTasks = subTasks.filter(subTask => subTask.id !== id);
    onSubTasksChange(updatedSubTasks);
  }, [subTasks, onSubTasksChange]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>子任务</Text>

      {/* 子任务列表 */}
      {subTasks.map(subTask => (
        <Animated.View key={subTask.id} style={styles.subTaskItem}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => handleToggleComplete(subTask.id)}
          >
            <MaterialIcons
              name={subTask.completed ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={subTask.completed ? '#4CAF50' : '#757575'}
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.subTaskTitle,
              subTask.completed && styles.completedSubTaskTitle,
            ]}
          >
            {subTask.title}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(subTask.id)}
          >
            <MaterialIcons name="close" size={20} color="#757575" />
          </TouchableOpacity>
        </Animated.View>
      ))}

      {/* 添加子任务输入框 */}
      <View style={styles.addContainer}>
        <TextInput
          style={styles.input}
          value={newSubTaskTitle}
          onChangeText={setNewSubTaskTitle}
          placeholder="添加子任务"
          placeholderTextColor="#9e9e9e"
          returnKeyType="done"
          onSubmitEditing={handleAddSubTask}
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            !newSubTaskTitle.trim() && styles.disabledAddButton,
          ]}
          onPress={handleAddSubTask}
          disabled={!newSubTaskTitle.trim()}
        >
          <MaterialIcons
            name="add"
            size={24}
            color={newSubTaskTitle.trim() ? '#2196F3' : '#BDBDBD'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 8,
  },
  subTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  checkbox: {
    marginRight: 8,
  },
  subTaskTitle: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
  },
  completedSubTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#757575',
  },
  deleteButton: {
    padding: 4,
  },
  addContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#212121',
    marginRight: 8,
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
  },
  disabledAddButton: {
    backgroundColor: '#F5F5F5',
  },
});

export default memo(SubTaskList); 