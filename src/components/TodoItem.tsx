import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import {
  PanGestureHandler,
  TapGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
  TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { Todo, TodoPriority } from '../types/todo';
import { useTheme } from '../contexts/ThemeContext';
import { useGesture } from '../contexts/GestureContext';

interface TodoItemProps {
  todo: Todo;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onComplete,
  onDelete,
  onSelect,
  isSelected,
  isSelectionMode,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const {
    isEnabled,
    isSwipeToCompleteEnabled,
    isSwipeToDeleteEnabled,
    isSwipeToEditEnabled,
    isLongPressToSelectEnabled,
    isDoubleTapToExpandEnabled,
    getSwipeThreshold,
  } = useGesture();

  const [isExpanded, setIsExpanded] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const tapRef = useRef(null);
  const doubleTapRef = useRef(null);

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const handleStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (!isEnabled) return;

    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      const threshold = getSwipeThreshold();

      if (translationX < -threshold && isSwipeToDeleteEnabled()) {
        // 左滑删除
        Alert.alert(
          '确认删除',
          '确定要删除这个待办事项吗？',
          [
            { text: '取消', style: 'cancel' },
            {
              text: '删除',
              style: 'destructive',
              onPress: () => onDelete(todo.id),
            },
          ]
        );
      } else if (translationX < -threshold / 2 && isSwipeToCompleteEnabled()) {
        // 左滑完成
        onComplete(todo.id);
      } else if (translationX > threshold && isSwipeToEditEnabled()) {
        // 右滑编辑
        navigation.navigate('EditTodo', { todoId: todo.id });
      }

      // 重置位置
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSingleTap = (event: TapGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      if (isSelectionMode) {
        onSelect?.(todo.id);
      } else {
        navigation.navigate('TodoDetail', { todoId: todo.id });
      }
    }
  };

  const handleDoubleTap = (event: TapGestureHandlerStateChangeEvent) => {
    if (!isEnabled || !isDoubleTapToExpandEnabled()) return;

    if (event.nativeEvent.state === State.ACTIVE) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleLongPress = (event: TapGestureHandlerStateChangeEvent) => {
    if (!isEnabled || !isLongPressToSelectEnabled()) return;

    if (event.nativeEvent.state === State.ACTIVE && !isSelectionMode) {
      onSelect?.(todo.id);
    }
  };

  const getPriorityColor = () => {
    switch (todo.priority) {
      case TodoPriority.High:
        return theme.colors.error;
      case TodoPriority.Medium:
        return theme.colors.warning;
      case TodoPriority.Low:
        return theme.colors.success;
      default:
        return theme.colors.text;
    }
  };

  return (
    <TapGestureHandler
      ref={tapRef}
      onHandlerStateChange={handleSingleTap}
      waitFor={doubleTapRef}
    >
      <TapGestureHandler
        ref={doubleTapRef}
        onHandlerStateChange={handleDoubleTap}
        numberOfTaps={2}
      >
        <TapGestureHandler
          onHandlerStateChange={handleLongPress}
          minDurationMs={500}
        >
          <PanGestureHandler
            onGestureEvent={handleGestureEvent}
            onHandlerStateChange={handleStateChange}
            enabled={isEnabled}
          >
            <Animated.View
              style={[
                styles.container,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  borderWidth: isSelected ? 2 : 1,
                  transform: [{ translateX }],
                },
              ]}
            >
              <View style={styles.header}>
                <View style={styles.titleContainer}>
                  {todo.priority && (
                    <Icon
                      name="flag"
                      size={16}
                      color={getPriorityColor()}
                      style={styles.priorityIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.title,
                      { color: theme.colors.text },
                      todo.completed && styles.completedTitle,
                    ]}
                    numberOfLines={isExpanded ? undefined : 1}
                  >
                    {todo.title}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => onComplete(todo.id)}
                  style={[
                    styles.checkbox,
                    {
                      borderColor: theme.colors.primary,
                      backgroundColor: todo.completed
                        ? theme.colors.primary
                        : 'transparent',
                    },
                  ]}
                >
                  {todo.completed && (
                    <Icon name="check" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>

              {isExpanded && (
                <View style={styles.details}>
                  {todo.description && (
                    <Text
                      style={[styles.description, { color: theme.colors.text + '99' }]}
                    >
                      {todo.description}
                    </Text>
                  )}
                  {todo.dueDate && (
                    <View style={styles.dueDate}>
                      <Icon
                        name="event"
                        size={16}
                        color={theme.colors.text + '99'}
                        style={styles.dueDateIcon}
                      />
                      <Text
                        style={[
                          styles.dueDateText,
                          { color: theme.colors.text + '99' },
                        ]}
                      >
                        {format(todo.dueDate, 'yyyy-MM-dd HH:mm')}
                      </Text>
                    </View>
                  )}
                  {todo.subTasks.length > 0 && (
                    <View style={styles.subTasks}>
                      <Text
                        style={[styles.subTasksTitle, { color: theme.colors.text }]}
                      >
                        子任务 ({todo.subTasks.filter(st => st.completed).length}/
                        {todo.subTasks.length})
                      </Text>
                      {todo.subTasks.map(subTask => (
                        <Text
                          key={subTask.id}
                          style={[
                            styles.subTaskText,
                            { color: theme.colors.text + '99' },
                            subTask.completed && styles.completedSubTask,
                          ]}
                        >
                          • {subTask.title}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </Animated.View>
          </PanGestureHandler>
        </TapGestureHandler>
      </TapGestureHandler>
    </TapGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  priorityIcon: {
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    marginTop: 12,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dueDateIcon: {
    marginRight: 4,
  },
  dueDateText: {
    fontSize: 14,
  },
  subTasks: {
    marginTop: 8,
  },
  subTasksTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  subTaskText: {
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 2,
  },
  completedSubTask: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
});

export default TodoItem; 