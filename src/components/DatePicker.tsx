import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  error?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = '选择日期',
  error,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  // 处理日期变化
  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setIsVisible(false);
    }
    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
        onChange(selectedDate);
      }
    }
  };

  // 处理确认
  const handleConfirm = () => {
    onChange(tempDate);
    setIsVisible(false);
  };

  // 处理取消
  const handleCancel = () => {
    setIsVisible(false);
  };

  // 处理清除
  const handleClear = () => {
    onChange(undefined);
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.container, error && styles.errorContainer]}
        onPress={() => setIsVisible(true)}
      >
        <MaterialIcons name="event" size={24} color="#757575" />
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value ? format(value, 'yyyy-MM-dd') : placeholder}
        </Text>
        {value && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
          >
            <MaterialIcons name="close" size={20} color="#757575" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {Platform.OS === 'ios' ? (
        <Modal
          visible={isVisible}
          transparent
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.cancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.confirmText}>确定</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={new Date()}
                locale="zh-CN"
              />
            </View>
          </View>
        </Modal>
      ) : (
        isVisible && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={handleChange}
            minimumDate={new Date()}
          />
        )
      )}
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelText: {
    fontSize: 16,
    color: '#757575',
  },
  confirmText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
});

export default memo(DatePicker); 