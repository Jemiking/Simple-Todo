import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, TextInput, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SyncService } from '../services/sync/SyncService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_CONFIG_KEY = '@sync_config';

interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
}

const SyncSettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [isEnabled, setIsEnabled] = useState(false);
  const [provider, setProvider] = useState<'firebase' | 'webdav'>('firebase');
  const [webdavConfig, setWebdavConfig] = useState<WebDAVConfig>({
    url: '',
    username: '',
    password: '',
  });
  const [lastSyncTime, setLastSyncTime] = useState<Date>();

  useEffect(() => {
    loadSyncConfig();
  }, []);

  const loadSyncConfig = async () => {
    try {
      const configStr = await AsyncStorage.getItem(SYNC_CONFIG_KEY);
      if (configStr) {
        const config = JSON.parse(configStr);
        setIsEnabled(config.enabled);
        setProvider(config.provider);
        if (config.provider === 'webdav' && config.webdav) {
          setWebdavConfig(config.webdav);
        }
      }

      const syncService = SyncService.getInstance();
      const time = await syncService.getLastSyncTime();
      setLastSyncTime(time);
    } catch (error) {
      console.error('加载同步配置失败:', error);
    }
  };

  const saveSyncConfig = async () => {
    try {
      const config = {
        enabled: isEnabled,
        provider,
        ...(provider === 'webdav' ? { webdav: webdavConfig } : {}),
      };

      await AsyncStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));

      const syncService = SyncService.getInstance();
      await syncService.initialize({
        enabled: isEnabled,
        provider,
        ...(provider === 'webdav' ? webdavConfig : {}),
      });

      Alert.alert('成功', '同步设置已保存');
    } catch (error) {
      console.error('保存同步配置失败:', error);
      Alert.alert('错误', '保存同步设置失败');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.text }]}>启用同步</Text>
          <Switch
            value={isEnabled}
            onValueChange={setIsEnabled}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
      </View>

      {isEnabled && (
        <>
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>同步方式</Text>
            <TouchableOpacity
              style={[styles.option, provider === 'firebase' && styles.selectedOption]}
              onPress={() => setProvider('firebase')}
            >
              <View style={styles.optionContent}>
                <Icon name="cloud" size={24} color={theme.colors.primary} style={styles.icon} />
                <Text style={[styles.optionText, { color: theme.colors.text }]}>Firebase</Text>
              </View>
              {provider === 'firebase' && (
                <Icon name="check" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, provider === 'webdav' && styles.selectedOption]}
              onPress={() => setProvider('webdav')}
            >
              <View style={styles.optionContent}>
                <Icon name="folder-shared" size={24} color={theme.colors.primary} style={styles.icon} />
                <Text style={[styles.optionText, { color: theme.colors.text }]}>WebDAV</Text>
              </View>
              {provider === 'webdav' && (
                <Icon name="check" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {provider === 'webdav' && (
            <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>WebDAV 设置</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                placeholder="WebDAV 服务器地址"
                placeholderTextColor={theme.colors.text + '80'}
                value={webdavConfig.url}
                onChangeText={(text) => setWebdavConfig({ ...webdavConfig, url: text })}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                placeholder="用户名"
                placeholderTextColor={theme.colors.text + '80'}
                value={webdavConfig.username}
                onChangeText={(text) => setWebdavConfig({ ...webdavConfig, username: text })}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                placeholder="密码"
                placeholderTextColor={theme.colors.text + '80'}
                value={webdavConfig.password}
                onChangeText={(text) => setWebdavConfig({ ...webdavConfig, password: text })}
                secureTextEntry
              />
            </View>
          )}

          {lastSyncTime && (
            <Text style={[styles.syncTime, { color: theme.colors.text }]}>
              上次同步时间: {lastSyncTime.toLocaleString()}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
            onPress={saveSyncConfig}
          >
            <Text style={styles.saveButtonText}>保存设置</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  syncTime: {
    textAlign: 'center',
    marginVertical: 16,
    fontStyle: 'italic',
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SyncSettingsScreen; 