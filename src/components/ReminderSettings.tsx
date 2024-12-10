import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';
import { NotificationService, ReminderConfig } from '../services/notificationService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';

interface ReminderSettingsProps {
  todoId: string;
  onReminderAdded?: (reminder: ReminderConfig) => void;
  onReminderUpdated?: (reminder: ReminderConfig) => void;
  onReminderDeleted?: (reminderId: string) => void;
}

const ReminderSettings: React.FC<ReminderSettingsProps> = ({
  todoId,
  onReminderAdded,
  onReminderUpdated,
  onReminderDeleted,
}) => {
  const { theme } = useTheme();
  const notificationService = NotificationService.getInstance();

  const [reminders, setReminders] = useState<ReminderConfig[]>([]);
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reminderType, setReminderType] = useState<'once' | 'repeat'>('once');
  const [repeatInterval, setRepeatInterval] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  useEffect(() => {
    loadReminders();
  }, [todoId]);

  const loadReminders = async () => {
    try {
      const todoReminders = await notificationService.getTodoReminders(todoId);
      setReminders(todoReminders);
    } catch (error) {
      console.error('加载提醒失败:', error);
    }
  };

  const handleAddReminder = async () => {
    try {
      const reminder: Omit<ReminderConfig, 'id' | 'createdAt' | 'updatedAt'> = {
        todoId,
        time: selectedDate,
        type: reminderType,
        enabled: true,
      };

      if (reminderType === 'repeat') {
        if (repeatInterval) {
          reminder.repeatInterval = parseInt(repeatInterval, 10);
        }
        if (selectedDays.length > 0) {
          reminder.repeatDays = selectedDays;
        }
      }

      const newReminder = await notificationService.createReminder(reminder);
      setReminders(prev => [...prev, newReminder]);
      onReminderAdded?.(newReminder);
      setIsAddingReminder(false);
      resetForm();
    } catch (error) {
      console.error('添加提醒失败:', error);
      Alert.alert('错误', '添加提醒失败');
    }
  };

  const handleUpdateReminder = async (reminder: ReminderConfig, enabled: boolean) => {
    try {
      const updatedReminder = await notificationService.updateReminder(reminder.id, { enabled });
      setReminders(prev =>
        prev.map(r => (r.id === reminder.id ? updatedReminder : r))
      );
      onReminderUpdated?.(updatedReminder);
    } catch (error) {
      console.error('更新提醒失败:', error);
      Alert.alert('错误', '更新提醒失败');
    }
  };

  const handleDeleteReminder = async (reminder: ReminderConfig) => {
    Alert.alert(
      '删除提醒',
      '确定要删除这个提醒吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteReminder(reminder.id);
              setReminders(prev => prev.filter(r => r.id !== reminder.id));
              onReminderDeleted?.(reminder.id);
            } catch (error) {
              console.error('删除提醒失败:', error);
              Alert.alert('错误', '删除提醒失败');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setSelectedDate(new Date());
    setReminderType('once');
    setRepeatInterval('');
    setSelectedDays([]);
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const renderDayPicker = () => {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return (
      <View style={styles.dayPicker}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              {
                backgroundColor: selectedDays.includes(index)
                  ? theme.colors.primary
                  : theme.colors.card,
              },
            ]}
            onPress={() => toggleDay(index)}
          >
            <Text
              style={[
                styles.dayButtonText,
                {
                  color: selectedDays.includes(index)
                    ? '#FFFFFF'
                    : theme.colors.text,
                },
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReminder = (reminder: ReminderConfig) => (
    <View
      key={reminder.id}
      style={[
        styles.reminderItem,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
    >
      <View style={styles.reminderInfo}>
        <Text style={[styles.reminderTime, { color: theme.colors.text }]}>
          {format(reminder.time, 'yyyy-MM-dd HH:mm')}
        </Text>
        <Text style={[styles.reminderType, { color: theme.colors.text + '80' }]}>
          {reminder.type === 'once' ? '单次' : '重复'}
          {reminder.repeatInterval
            ? ` (每${reminder.repeatInterval}分钟)`
            : reminder.repeatDays
            ? ` (每周${reminder.repeatDays
                .map(d => '日一二三四五六'[d])
                .join('、')})`
            : ''}
        </Text>
      </View>
      <View style={styles.reminderActions}>
        <Switch
          value={reminder.enabled}
          onValueChange={value => handleUpdateReminder(reminder, value)}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
          thumbColor={reminder.enabled ? theme.colors.primary : '#f4f3f4'}
        />
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteReminder(reminder)}
        >
          <Icon name="delete" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>提醒</Text>
        <TouchableOpacity
          style={[styles.addButton, { borderColor: theme.colors.border }]}
          onPress={() => setIsAddingReminder(true)}
        >
          <Icon name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {isAddingReminder && (
        <View style={styles.addForm}>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                {
                  backgroundColor:
                    reminderType === 'once' ? theme.colors.primary : theme.colors.card,
                },
              ]}
              onPress={() => setReminderType('once')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  { color: reminderType === 'once' ? '#FFFFFF' : theme.colors.text },
                ]}
              >
                单次
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                {
                  backgroundColor:
                    reminderType === 'repeat' ? theme.colors.primary : theme.colors.card,
                },
              ]}
              onPress={() => setReminderType('repeat')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  { color: reminderType === 'repeat' ? '#FFFFFF' : theme.colors.text },
                ]}
              >
                重复
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: theme.colors.card }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
              {format(selectedDate, 'yyyy-MM-dd')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: theme.colors.card }]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
              {format(selectedDate, 'HH:mm')}
            </Text>
          </TouchableOpacity>

          {reminderType === 'repeat' && (
            <View style={styles.repeatSettings}>
              <TextInput
                style={[
                  styles.intervalInput,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.card,
                  },
                ]}
                placeholder="重复间隔（分钟）"
                placeholderTextColor={theme.colors.text + '80'}
                value={repeatInterval}
                onChangeText={setRepeatInterval}
                keyboardType="number-pad"
              />
              {renderDayPicker()}
            </View>
          )}

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={() => {
                setIsAddingReminder(false);
                resetForm();
              }}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                取消
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddReminder}
            >
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.reminderList}>
        {reminders.map(renderReminder)}
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              const newDate = new Date(selectedDate);
              newDate.setFullYear(date.getFullYear());
              newDate.setMonth(date.getMonth());
              newDate.setDate(date.getDate());
              setSelectedDate(newDate);
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="time"
          display="default"
          onChange={(event, date) => {
            setShowTimePicker(false);
            if (date) {
              const newDate = new Date(selectedDate);
              newDate.setHours(date.getHours());
              newDate.setMinutes(date.getMinutes());
              setSelectedDate(newDate);
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
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
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateButton: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  dateButtonText: {
    fontSize: 14,
  },
  repeatSettings: {
    marginTop: 8,
  },
  intervalInput: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  dayPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonText: {
    fontSize: 14,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
  },
  saveButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  reminderList: {
    marginTop: 8,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  reminderType: {
    fontSize: 12,
    marginTop: 4,
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
}); 