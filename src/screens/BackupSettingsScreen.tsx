import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { BackupService, BackupConfig } from '../services/backup/BackupService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Text } from 'react-native';
import { format } from 'date-fns';
import { Slider } from '@react-native-community/slider';

const BackupSettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [config, setConfig] = useState<BackupConfig>({
    enabled: false,
    interval: 24,
    maxBackups: 7,
  });
  const [backups, setBackups] = useState<{ path: string; date: Date }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig();
    loadBackups();
  }, []);

  const loadConfig = async () => {
    try {
      const backupService = BackupService.getInstance();
      await backupService.initialize();
      setConfig(backupService.getConfig());
    } catch (error) {
      console.error('加载备份配置失败:', error);
      Alert.alert('错误', '加载备份配置失败');
    }
  };

  const loadBackups = async () => {
    try {
      const backupService = BackupService.getInstance();
      const backupList = await backupService.listBackups();
      setBackups(backupList);
    } catch (error) {
      console.error('加载备份列表失败:', error);
      Alert.alert('错误', '加载备份列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEnabled = async (value: boolean) => {
    try {
      const backupService = BackupService.getInstance();
      await backupService.saveConfig({ enabled: value });
      setConfig(prev => ({ ...prev, enabled: value }));
    } catch (error) {
      console.error('更新备份设置失败:', error);
      Alert.alert('错误', '更新备份设置失败');
    }
  };

  const handleIntervalChange = async (value: number) => {
    try {
      const backupService = BackupService.getInstance();
      await backupService.saveConfig({ interval: value });
      setConfig(prev => ({ ...prev, interval: value }));
    } catch (error) {
      console.error('更新备份间隔失败:', error);
      Alert.alert('错误', '更新备份间隔失败');
    }
  };

  const handleMaxBackupsChange = async (value: number) => {
    try {
      const backupService = BackupService.getInstance();
      await backupService.saveConfig({ maxBackups: value });
      setConfig(prev => ({ ...prev, maxBackups: value }));
    } catch (error) {
      console.error('更新最大备份数失败:', error);
      Alert.alert('错误', '更新最大备份数失败');
    }
  };

  const handleCreateBackup = async () => {
    try {
      const backupService = BackupService.getInstance();
      await backupService.createBackup();
      await loadBackups();
      Alert.alert('成功', '已创建新的备份');
    } catch (error) {
      console.error('创建备份失败:', error);
      Alert.alert('错误', '创建备份失败');
    }
  };

  const handleRestoreBackup = async (backupPath: string) => {
    Alert.alert(
      '确认恢复',
      '恢复备份将覆盖当前所有数据，确定要继续吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              const backupService = BackupService.getInstance();
              await backupService.restoreFromBackup(backupPath);
              Alert.alert('成功', '已恢复备份数据');
            } catch (error) {
              console.error('恢复备份失败:', error);
              Alert.alert('错误', '恢复备份失败');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.text }]}>启用自动备份</Text>
          <Switch
            value={config.enabled}
            onValueChange={handleToggleEnabled}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
      </View>

      {config.enabled && (
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>备份设置</Text>
          <View style={styles.sliderContainer}>
            <Text style={[styles.sliderLabel, { color: theme.colors.text }]}>
              备份间隔: {config.interval} 小时
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={72}
              step={1}
              value={config.interval}
              onValueChange={handleIntervalChange}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.border}
              thumbTintColor={theme.colors.primary}
            />
          </View>
          <View style={styles.sliderContainer}>
            <Text style={[styles.sliderLabel, { color: theme.colors.text }]}>
              保留备份数: {config.maxBackups} 个
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={30}
              step={1}
              value={config.maxBackups}
              onValueChange={handleMaxBackupsChange}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.border}
              thumbTintColor={theme.colors.primary}
            />
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={handleCreateBackup}
      >
        <Text style={styles.buttonText}>立即备份</Text>
      </TouchableOpacity>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>备份历史</Text>
        {isLoading ? (
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>加载中...</Text>
        ) : backups.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>暂无备份</Text>
        ) : (
          backups.map((backup, index) => (
            <TouchableOpacity
              key={backup.path}
              style={[
                styles.backupItem,
                {
                  borderBottomColor: theme.colors.border,
                  borderBottomWidth: index < backups.length - 1 ? 1 : 0,
                },
              ]}
              onPress={() => handleRestoreBackup(backup.path)}
            >
              <View>
                <Text style={[styles.backupDate, { color: theme.colors.text }]}>
                  {format(backup.date, 'yyyy-MM-dd HH:mm:ss')}
                </Text>
              </View>
              <Icon name="restore" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backupDate: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default BackupSettingsScreen; 