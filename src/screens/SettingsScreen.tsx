import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { BackupService } from '../services/backup/BackupService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Text } from 'react-native';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme, colorMode } = useTheme();
  const [lastBackupTime, setLastBackupTime] = useState<Date | undefined>();

  useEffect(() => {
    loadBackupInfo();
  }, []);

  const loadBackupInfo = async () => {
    try {
      const backupService = BackupService.getInstance();
      await backupService.initialize();
      const config = backupService.getConfig();
      setLastBackupTime(config.lastBackupTime);
    } catch (error) {
      console.error('加载备份信息失败:', error);
    }
  };

  const getThemeModeLabel = () => {
    switch (colorMode) {
      case 'light':
        return '浅色模式';
      case 'dark':
        return '深色模式';
      case 'system':
        return '跟随系统';
      default:
        return '未知';
    }
  };

  const settingsOptions = [
    {
      title: '主题设置',
      subtitle: getThemeModeLabel(),
      icon: 'palette',
      onPress: () => navigation.navigate('ThemeSettings'),
    },
    {
      title: '同步设置',
      subtitle: '配置云端同步',
      icon: 'sync',
      onPress: () => navigation.navigate('SyncSettings'),
    },
    {
      title: '备份设置',
      subtitle: lastBackupTime ? `上次备份: ${lastBackupTime.toLocaleString()}` : '未备份',
      icon: 'backup',
      onPress: () => navigation.navigate('BackupSettings'),
    },
    {
      title: '标签管理',
      subtitle: '管理标签和标签组',
      icon: 'label',
      onPress: () => navigation.navigate('TagManagement'),
    },
    {
      title: '手势设置',
      subtitle: '配置手势操作',
      icon: 'gesture',
      onPress: () => navigation.navigate('GestureSettings'),
    },
    {
      title: '快捷键设置',
      subtitle: '配置键盘快捷键',
      icon: 'keyboard',
      onPress: () => navigation.navigate('ShortcutSettings'),
    },
    {
      title: '语言设置',
      subtitle: '切换应用语言',
      icon: 'language',
      onPress: () => navigation.navigate('LanguageSettings'),
    },
    {
      title: '设备同步',
      subtitle: '管理多设备同步',
      icon: 'devices',
      onPress: () => navigation.navigate('DeviceSync'),
    },
    {
      title: '版本历史',
      subtitle: '查看和管理版本历史',
      icon: 'history',
      onPress: () => navigation.navigate('VersionHistory'),
    },
    // 其他设置选项...
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {settingsOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.option,
            {
              backgroundColor: theme.colors.card,
              borderBottomColor: theme.colors.border,
              borderBottomWidth: index < settingsOptions.length - 1 ? 1 : 0,
            },
          ]}
          onPress={option.onPress}
        >
          <View style={styles.optionContent}>
            <Icon name={option.icon} size={24} color={theme.colors.primary} style={styles.icon} />
            <View style={styles.optionText}>
              <Text style={[styles.title, { color: theme.colors.text }]}>{option.title}</Text>
              <Text style={[styles.subtitle, { color: theme.colors.text }]}>{option.subtitle}</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
});

export default SettingsScreen; 