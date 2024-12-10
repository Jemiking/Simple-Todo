import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Todo } from '../types/todo';

interface BatchOperationsProps {
  todos: Todo[];
  onToggleComplete: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
  onBatchModeChange: (enabled: boolean) => void;
}

const BatchOperations: React.FC<BatchOperationsProps> = ({
  todos,
  onToggleComplete,
  onDelete,
  onBatchModeChange,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [slideAnim] = useState(new Animated.Value(0));

  // 处理选择切换
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }, []);

  // 处理全选/取消全选
  const handleToggleAll = useCallback(() => {
    setSelectedIds(prev =>
      prev.length === todos.length
        ? []
        : todos.map(todo => todo.id)
    );
  }, [todos]);

  // 处理批量完成/取���完成
  const handleToggleComplete = useCallback(() => {
    if (selectedIds.length === 0) return;
    onToggleComplete(selectedIds);
    setSelectedIds([]);
  }, [selectedIds, onToggleComplete]);

  // 处理批量删除
  const handleDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    Alert.alert(
      '确认删除',
      `确定要删除选中的 ${selectedIds.length} 个待办事项吗？`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            onDelete(selectedIds);
            setSelectedIds([]);
          },
        },
      ],
      { cancelable: true }
    );
  }, [selectedIds, onDelete]);

  // 处理退出批量模式
  const handleExit = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedIds([]);
      onBatchModeChange(false);
    });
  }, [slideAnim, onBatchModeChange]);

  // 进入批量模式
  const handleEnter = useCallback(() => {
    onBatchModeChange(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [slideAnim, onBatchModeChange]);

  return (
    <View style={styles.container}>
      {/* 批量操作按钮 */}
      <TouchableOpacity
        style={styles.batchButton}
        onPress={handleEnter}
      >
        <MaterialIcons name="playlist-add-check" size={24} color="#757575" />
      </TouchableOpacity>

      {/* 批量操作工具栏 */}
      <Animated.View
        style={[
          styles.toolbar,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
            opacity: slideAnim,
          },
        ]}
      >
        <View style={styles.toolbarContent}>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={handleToggleAll}
          >
            <MaterialIcons
              name={selectedIds.length === todos.length ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color="#757575"
            />
            <Text style={styles.toolbarText}>
              {selectedIds.length === todos.length ? '取消全选' : '全选'}
            </Text>
          </TouchableOpacity>

          <View style={styles.toolbarActions}>
            <TouchableOpacity
              style={[
                styles.toolbarButton,
                selectedIds.length === 0 && styles.disabledButton,
              ]}
              onPress={handleToggleComplete}
              disabled={selectedIds.length === 0}
            >
              <MaterialIcons
                name="done-all"
                size={24}
                color={selectedIds.length === 0 ? '#BDBDBD' : '#757575'}
              />
              <Text
                style={[
                  styles.toolbarText,
                  selectedIds.length === 0 && styles.disabledText,
                ]}
              >
                完成
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toolbarButton,
                selectedIds.length === 0 && styles.disabledButton,
              ]}
              onPress={handleDelete}
              disabled={selectedIds.length === 0}
            >
              <MaterialIcons
                name="delete"
                size={24}
                color={selectedIds.length === 0 ? '#BDBDBD' : '#f44336'}
              />
              <Text
                style={[
                  styles.toolbarText,
                  selectedIds.length === 0 && styles.disabledText,
                  { color: '#f44336' },
                ]}
              >
                删除
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={handleExit}
            >
              <MaterialIcons name="close" size={24} color="#757575" />
              <Text style={styles.toolbarText}>退出</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  batchButton: {
    position: 'absolute',
    right: 80,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  toolbar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },
  toolbarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  toolbarText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#757575',
  },
  toolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#BDBDBD',
  },
});

export default memo(BatchOperations); 