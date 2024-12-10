import React from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, Text, Slider } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useGesture } from '../contexts/GestureContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const GestureSettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { config, updateConfig } = useGesture();

  const handleToggle = async (key: keyof typeof config, value: boolean) => {
    try {
      await updateConfig({ [key]: value });
    } catch (error) {
      console.error('更新手势设置失败:', error);
    }
  };

  const handleThresholdChange = async (value: number) => {
    try {
      await updateConfig({ swipeThreshold: value });
    } catch (error) {
      console.error('更新滑动阈值失败:', error);
    }
  };

  const renderSwitch = (
    key: keyof typeof config,
    label: string,
    icon: string,
    description: string
  ) => {
    if (typeof config[key] !== 'boolean') return null;

    return (
      <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.settingHeader}>
          <Icon name={icon} size={24} color={theme.colors.primary} />
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{label}</Text>
            <Text style={[styles.settingDescription, { color: theme.colors.text + '80' }]}>
              {description}
            </Text>
          </View>
          <Switch
            value={config[key] as boolean}
            onValueChange={(value) => handleToggle(key, value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
            thumbColor={config[key] ? theme.colors.primary : '#f4f3f4'}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>基本设置</Text>
        {renderSwitch(
          'enabled',
          '启用手势操作',
          'gesture',
          '开启或关闭所有手势功能'
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>滑动操作</Text>
        {renderSwitch(
          'swipeToComplete',
          '左滑完��',
          'check',
          '左滑快速标记待办事项为已完成'
        )}
        {renderSwitch(
          'swipeToDelete',
          '左滑删除',
          'delete',
          '左滑快速删除待办事项'
        )}
        {renderSwitch(
          'swipeToEdit',
          '右滑编辑',
          'edit',
          '右滑快速进入编辑模式'
        )}
        <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.settingHeader}>
            <Icon name="swap-horiz" size={24} color={theme.colors.primary} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                滑动灵敏度
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.text + '80' }]}>
                调整滑动触发的距离阈值
              </Text>
            </View>
          </View>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={30}
              maximumValue={100}
              step={1}
              value={config.swipeThreshold}
              onValueChange={handleThresholdChange}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.border}
              thumbTintColor={theme.colors.primary}
            />
            <Text style={[styles.sliderValue, { color: theme.colors.text }]}>
              {config.swipeThreshold}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>触摸操作</Text>
        {renderSwitch(
          'longPressToSelect',
          '长按多选',
          'select-all',
          '长按进入多选模式'
        )}
        {renderSwitch(
          'doubleTapToExpand',
          '双击展开',
          'unfold-more',
          '双击展开或收起待办事项详情'
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
  },
  settingItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginLeft: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  sliderContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    marginLeft: 16,
    width: 40,
    textAlign: 'right',
  },
});

export default GestureSettingsScreen; 