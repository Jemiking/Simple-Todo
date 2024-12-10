import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TodoPriority } from '../types/todo';

interface PriorityPickerProps {
  value: TodoPriority | undefined;
  onChange: (priority: TodoPriority | undefined) => void;
  visible: boolean;
  onClose: () => void;
  error?: string;
}

const PriorityPicker: React.FC<PriorityPickerProps> = ({
  value,
  onChange,
  visible,
  onClose,
  error,
}) => {
  // 优先级配置
  const priorities = [
    { value: TodoPriority.High, label: '高', color: '#ff4444', icon: 'flag' },
    { value: TodoPriority.Medium, label: '中', color: '#ffbb33', icon: 'flag' },
    { value: TodoPriority.Low, label: '低', color: '#00C851', icon: 'flag' },
  ];

  // 处理选择
  const handleSelect = (priority: TodoPriority) => {
    onChange(value === priority ? undefined : priority);
    onClose();
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.container, error && styles.errorContainer]}
        onPress={() => onClose()}
      >
        <MaterialIcons
          name="flag"
          size={24}
          color={value ? priorities.find(p => p.value === value)?.color : '#757575'}
        />
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value ? priorities.find(p => p.value === value)?.label + '优先级' : '设置优先级'}
        </Text>
        {value && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => onChange(undefined)}
          >
            <MaterialIcons name="close" size={20} color="#757575" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

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
            <Text style={styles.title}>选择优先级</Text>
            <View style={styles.options}>
              {priorities.map(({ value: p, label, color }) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.option,
                    { backgroundColor: color },
                    value === p && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(p)}
                >
                  <MaterialIcons
                    name="flag"
                    size={24}
                    color="white"
                  />
                  <Text style={styles.optionText}>{label}优先级</Text>
                  {value === p && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color="white"
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
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
  text: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#212121',
  },
  placeholder: {
    color: '#9e9e9e',
  },
  clearButton: {
    padding: 4,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '80%',
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 16,
    textAlign: 'center',
  },
  options: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  optionText: {
    marginLeft: 8,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 'auto',
  },
});

export default memo(PriorityPicker); 