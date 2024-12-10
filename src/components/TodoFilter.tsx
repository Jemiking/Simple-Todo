import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export type FilterType = 'all' | 'active' | 'completed';

interface TodoFilterProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  activeCount: number;
  completedCount: number;
}

const TodoFilter: React.FC<TodoFilterProps> = ({
  currentFilter,
  onFilterChange,
  activeCount,
  completedCount,
}) => {
  // 过滤选项配置
  const filters: { type: FilterType; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { type: 'all', label: '全部', icon: 'list' },
    { type: 'active', label: '进行中', icon: 'radio-button-unchecked' },
    { type: 'completed', label: '已完成', icon: 'check-circle' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.filterButtons}>
        {filters.map(({ type, label, icon }) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              currentFilter === type && styles.activeFilterButton,
            ]}
            onPress={() => onFilterChange(type)}
          >
            <MaterialIcons
              name={icon}
              size={20}
              color={currentFilter === type ? '#2196F3' : '#757575'}
            />
            <Text
              style={[
                styles.filterText,
                currentFilter === type && styles.activeFilterText,
              ]}
            >
              {label}
            </Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {type === 'all'
                  ? activeCount + completedCount
                  : type === 'active'
                  ? activeCount
                  : completedCount}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeFilterButton: {
    backgroundColor: '#E3F2FD',
  },
  filterText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#757575',
  },
  activeFilterText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  countBadge: {
    marginLeft: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#EEEEEE',
  },
  countText: {
    fontSize: 12,
    color: '#757575',
  },
});

export default memo(TodoFilter); 