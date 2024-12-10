import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RepeatType, RepeatConfig } from '../types/todo';
import DatePicker from './DatePicker';

interface RepeatPickerProps {
  value?: RepeatConfig;
  onChange: (config: RepeatConfig | undefined) => void;
  visible: boolean;
  onClose: () => void;
  error?: string;
}

const RepeatPicker: React.FC<RepeatPickerProps> = ({
  value,
  onChange,
  visible,
  onClose,
  error,
}) => {
  // 重复类型配置
  const repeatTypes = [
    { type: RepeatType.Daily, label: '每天', icon: 'today' },
    { type: RepeatType.Weekly, label: '每周', icon: 'view-week' },
    { type: RepeatType.Monthly, label: '每月', icon: 'calendar-today' },
    { type: RepeatType.Yearly, label: '每年', icon: 'event' },
    { type: RepeatType.Custom, label: '自定义', icon: 'tune' },
  ];

  // 星期几选项
  const weekDays = [
    { value: 0, label: '周日' },
    { value: 1, label: '周一' },
    { value: 2, label: '周二' },
    { value: 3, label: '周三' },
    { value: 4, label: '周四' },
    { value: 5, label: '周五' },
    { value: 6, label: '周六' },
  ];

  const [tempConfig, setTempConfig] = useState<RepeatConfig | undefined>(value);
  const [showCustomConfig, setShowCustomConfig] = useState(false);

  // 处理重复类型选择
  const handleTypeSelect = useCallback((type: RepeatType) => {
    if (type === RepeatType.Custom) {
      setShowCustomConfig(true);
      return;
    }

    const newConfig: RepeatConfig = {
      type,
      interval: 1,
    };

    if (type === RepeatType.Weekly) {
      newConfig.weekDays = [new Date().getDay()];
    } else if (type === RepeatType.Monthly) {
      newConfig.monthDay = new Date().getDate();
    }

    onChange(newConfig);
    onClose();
  }, [onChange, onClose]);

  // 处理自定义配置保存
  const handleCustomConfigSave = useCallback(() => {
    if (tempConfig) {
      onChange(tempConfig);
      setShowCustomConfig(false);
      onClose();
    }
  }, [tempConfig, onChange, onClose]);

  // 处理星期几选择
  const handleWeekDayToggle = useCallback((day: number) => {
    if (!tempConfig) return;

    const weekDays = tempConfig.weekDays || [];
    const newWeekDays = weekDays.includes(day)
      ? weekDays.filter(d => d !== day)
      : [...weekDays, day].sort();

    setTempConfig({
      ...tempConfig,
      weekDays: newWeekDays,
    });
  }, [tempConfig]);

  // 获取重复描述文本
  const getRepeatText = (config?: RepeatConfig) => {
    if (!config) return '设置重复';

    switch (config.type) {
      case RepeatType.Daily:
        return config.interval === 1 ? '每天' : `每${config.interval}天`;
      case RepeatType.Weekly:
        if (config.weekDays?.length === 1) {
          return `每周${weekDays[config.weekDays[0]].label}`;
        }
        return '每周多天';
      case RepeatType.Monthly:
        return config.interval === 1 ? '每月' : `每${config.interval}个月`;
      case RepeatType.Yearly:
        return config.interval === 1 ? '每年' : `每${config.interval}年`;
      case RepeatType.Custom:
        return '自定义';
      default:
        return '设置重复';
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.container, error && styles.errorContainer]}
        onPress={() => onClose()}
      >
        <MaterialIcons
          name="repeat"
          size={24}
          color={value ? '#2196F3' : '#757575'}
        />
        <Text style={[styles.text, !value && styles.placeholder]}>
          {getRepeatText(value)}
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
        animationType="slide"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.modalContent}>
            <Text style={styles.title}>重复设置</Text>
            <ScrollView style={styles.options}>
              {repeatTypes.map(({ type, label, icon }) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.option,
                    value?.type === type && styles.selectedOption,
                  ]}
                  onPress={() => handleTypeSelect(type)}
                >
                  <MaterialIcons
                    name={icon}
                    size={24}
                    color={value?.type === type ? '#2196F3' : '#757575'}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      value?.type === type && styles.selectedOptionText,
                    ]}
                  >
                    {label}
                  </Text>
                  {value?.type === type && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color="#2196F3"
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showCustomConfig}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomConfig(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setShowCustomConfig(false)}>
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
              <Text style={styles.title}>自定义重复</Text>
              <TouchableOpacity onPress={handleCustomConfigSave}>
                <Text style={styles.saveText}>保存</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.customOptions}>
              {/* 重复间隔 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>重复间隔</Text>
                <View style={styles.intervalContainer}>
                  <TouchableOpacity
                    style={styles.intervalButton}
                    onPress={() => setTempConfig(prev => prev && {
                      ...prev,
                      interval: Math.max(1, (prev.interval || 1) - 1),
                    })}
                  >
                    <MaterialIcons name="remove" size={24} color="#757575" />
                  </TouchableOpacity>
                  <Text style={styles.intervalText}>
                    {tempConfig?.interval || 1}
                  </Text>
                  <TouchableOpacity
                    style={styles.intervalButton}
                    onPress={() => setTempConfig(prev => prev && {
                      ...prev,
                      interval: (prev.interval || 1) + 1,
                    })}
                  >
                    <MaterialIcons name="add" size={24} color="#757575" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 星期几选择 */}
              {tempConfig?.type === RepeatType.Weekly && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>重复日期</Text>
                  <View style={styles.weekDays}>
                    {weekDays.map(({ value, label }) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.weekDay,
                          tempConfig.weekDays?.includes(value) && styles.selectedWeekDay,
                        ]}
                        onPress={() => handleWeekDayToggle(value)}
                      >
                        <Text
                          style={[
                            styles.weekDayText,
                            tempConfig.weekDays?.includes(value) && styles.selectedWeekDayText,
                          ]}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* 结束条件 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>结束条件</Text>
                <View style={styles.endCondition}>
                  <TouchableOpacity
                    style={styles.endConditionOption}
                    onPress={() => setTempConfig(prev => prev && {
                      ...prev,
                      endDate: undefined,
                      endTimes: undefined,
                    })}
                  >
                    <MaterialIcons
                      name="radio-button-checked"
                      size={24}
                      color={!tempConfig?.endDate && !tempConfig?.endTimes ? '#2196F3' : '#757575'}
                    />
                    <Text style={styles.endConditionText}>永不结束</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.endConditionOption}
                    onPress={() => setTempConfig(prev => prev && {
                      ...prev,
                      endDate: new Date(),
                      endTimes: undefined,
                    })}
                  >
                    <MaterialIcons
                      name="radio-button-checked"
                      size={24}
                      color={tempConfig?.endDate ? '#2196F3' : '#757575'}
                    />
                    <Text style={styles.endConditionText}>结束日期</Text>
                  </TouchableOpacity>

                  {tempConfig?.endDate && (
                    <DatePicker
                      value={tempConfig.endDate}
                      onChange={(date) => setTempConfig(prev => prev && {
                        ...prev,
                        endDate: date,
                      })}
                    />
                  )}

                  <TouchableOpacity
                    style={styles.endConditionOption}
                    onPress={() => setTempConfig(prev => prev && {
                      ...prev,
                      endDate: undefined,
                      endTimes: 1,
                    })}
                  >
                    <MaterialIcons
                      name="radio-button-checked"
                      size={24}
                      color={tempConfig?.endTimes ? '#2196F3' : '#757575'}
                    />
                    <Text style={styles.endConditionText}>重复次数</Text>
                  </TouchableOpacity>

                  {tempConfig?.endTimes !== undefined && (
                    <View style={styles.intervalContainer}>
                      <TouchableOpacity
                        style={styles.intervalButton}
                        onPress={() => setTempConfig(prev => prev && {
                          ...prev,
                          endTimes: Math.max(1, (prev.endTimes || 1) - 1),
                        })}
                      >
                        <MaterialIcons name="remove" size={24} color="#757575" />
                      </TouchableOpacity>
                      <Text style={styles.intervalText}>
                        {tempConfig.endTimes}
                      </Text>
                      <TouchableOpacity
                        style={styles.intervalButton}
                        onPress={() => setTempConfig(prev => prev && {
                          ...prev,
                          endTimes: (prev.endTimes || 1) + 1,
                        })}
                      >
                        <MaterialIcons name="add" size={24} color="#757575" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#212121',
    textAlign: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#757575',
  },
  saveText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
  options: {
    padding: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#757575',
  },
  selectedOptionText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  customOptions: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 12,
  },
  intervalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intervalButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  intervalText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#212121',
    marginHorizontal: 16,
  },
  weekDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weekDay: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  selectedWeekDay: {
    backgroundColor: '#E3F2FD',
  },
  weekDayText: {
    fontSize: 14,
    color: '#757575',
  },
  selectedWeekDayText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  endCondition: {
    gap: 16,
  },
  endConditionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  endConditionText: {
    fontSize: 16,
    color: '#212121',
  },
});

export default memo(RepeatPicker); 