import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export type SortType = 'createdAt' | 'dueDate' | 'priority' | 'title';
export type SortOrder = 'asc' | 'desc';

interface TodoSortProps {
  currentSort: SortType;
  currentOrder: SortOrder;
  onSortChange: (sort: SortType) => void;
  onOrderChange: (order: SortOrder) => void;
  visible: boolean;
  onClose: () => void;
}

const TodoSort: React.FC<TodoSortProps> = ({
  currentSort,
  currentOrder,
  onSortChange,
  onOrderChange,
  visible,
  onClose,
}) => {
  // 排序选项配置
  const sortOptions: { type: SortType; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { type: 'createdAt', label: '创建时间', icon: 'access-time' },
    { type: 'dueDate', label: '截止日期', icon: 'event' },
    { type: 'priority', label: '优先级', icon: 'flag' },
    { type: 'title', label: '标题', icon: 'sort-by-alpha' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>排序方式</Text>
            <TouchableOpacity
              style={styles.orderButton}
              onPress={() => onOrderChange(currentOrder === 'asc' ? 'desc' : 'asc')}
            >
              <MaterialIcons
                name={currentOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'}
                size={24}
                color="#2196F3"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.options}>
            {sortOptions.map(({ type, label, icon }) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.option,
                  currentSort === type && styles.activeOption,
                ]}
                onPress={() => {
                  onSortChange(type);
                  onClose();
                }}
              >
                <MaterialIcons
                  name={icon}
                  size={24}
                  color={currentSort === type ? '#2196F3' : '#757575'}
                />
                <Text
                  style={[
                    styles.optionText,
                    currentSort === type && styles.activeOptionText,
                  ]}
                >
                  {label}
                </Text>
                {currentSort === type && (
                  <MaterialIcons
                    name="check"
                    size={20}
                    color="#2196F3"
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
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
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#212121',
  },
  orderButton: {
    padding: 8,
  },
  options: {
    paddingHorizontal: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  activeOption: {
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#757575',
  },
  activeOptionText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 'auto',
  },
});

export default memo(TodoSort); 