import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useDevice } from '../contexts/DeviceContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useI18n } from '../contexts/I18nContext';
import { DeviceInfo } from '../services/deviceSyncService';

const DeviceSyncScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const {
    deviceInfo,
    pairedDevices,
    syncState,
    addPairedDevice,
    removePairedDevice,
    updateSyncState,
    syncWithPairedDevices,
    isDeviceOnline,
  } = useDevice();

  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [deviceCode, setDeviceCode] = useState('');

  const handleToggleSync = async (value: boolean) => {
    try {
      await updateSyncState({ enabled: value });
    } catch (error) {
      console.error('更新同步状态失败:', error);
      Alert.alert(t('error.unknown'));
    }
  };

  const handleToggleAutoSync = async (value: boolean) => {
    try {
      await updateSyncState({ autoSync: value });
    } catch (error) {
      console.error('更新自动同步状态失败:', error);
      Alert.alert(t('error.unknown'));
    }
  };

  const handleSyncIntervalChange = async (value: number) => {
    try {
      await updateSyncState({ syncInterval: value });
    } catch (error) {
      console.error('更新同步间隔失败:', error);
      Alert.alert(t('error.unknown'));
    }
  };

  const handleConflictResolutionChange = async (value: 'manual' | 'lastModified' | 'devicePriority') => {
    try {
      await updateSyncState({ conflictResolution: value });
    } catch (error) {
      console.error('更新冲突解决策略失败:', error);
      Alert.alert(t('error.unknown'));
    }
  };

  const handleManualSync = async () => {
    try {
      await syncWithPairedDevices();
      Alert.alert(t('success'), t('sync.manual_sync_success'));
    } catch (error) {
      console.error('手动同步失败:', error);
      Alert.alert(t('error.unknown'));
    }
  };

  const handleAddDevice = async () => {
    if (!deviceCode.trim()) {
      Alert.alert(t('error.required'));
      return;
    }

    try {
      // 这里应该实现实际的设备配对逻辑
      const newDevice: DeviceInfo = {
        id: deviceCode,
        name: 'New Device',
        platform: 'unknown',
      };
      await addPairedDevice(newDevice);
      setIsAddingDevice(false);
      setDeviceCode('');
      Alert.alert(t('success'), t('sync.device_paired_success'));
    } catch (error) {
      console.error('添加设备失败:', error);
      Alert.alert(t('error.unknown'));
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    Alert.alert(
      t('confirm'),
      t('sync.remove_device_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await removePairedDevice(deviceId);
              Alert.alert(t('success'), t('sync.device_removed_success'));
            } catch (error) {
              console.error('移除设备失败:', error);
              Alert.alert(t('error.unknown'));
            }
          },
        },
      ]
    );
  };

  const renderDeviceItem = (device: DeviceInfo) => (
    <View
      key={device.id}
      style={[
        styles.deviceItem,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
    >
      <View style={styles.deviceInfo}>
        <Icon
          name={device.platform === 'ios' ? 'phone-iphone' : 'phone-android'}
          size={24}
          color={theme.colors.primary}
        />
        <View style={styles.deviceDetails}>
          <Text style={[styles.deviceName, { color: theme.colors.text }]}>
            {device.name}
          </Text>
          <Text
            style={[styles.deviceStatus, { color: theme.colors.text + '80' }]}
          >
            {isDeviceOnline(device.id)
              ? t('sync.device_online')
              : t('sync.device_offline')}
          </Text>
          {device.lastSyncTime && (
            <Text
              style={[styles.lastSync, { color: theme.colors.text + '80' }]}
            >
              {t('sync.last_sync')}: {device.lastSyncTime.toLocaleString()}
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveDevice(device.id)}
      >
        <Icon name="delete" size={24} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.section}>
          <View
            style={[
              styles.settingItem,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                {t('sync.enable')}
              </Text>
              <Text
                style={[styles.settingDescription, { color: theme.colors.text + '80' }]}
              >
                {t('sync.enable_description')}
              </Text>
            </View>
            <Switch
              value={syncState.enabled}
              onValueChange={handleToggleSync}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
              thumbColor={syncState.enabled ? theme.colors.primary : '#f4f3f4'}
            />
          </View>

          {syncState.enabled && (
            <>
              <View
                style={[
                  styles.settingItem,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                ]}
              >
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                    {t('sync.auto')}
                  </Text>
                  <Text
                    style={[styles.settingDescription, { color: theme.colors.text + '80' }]}
                  >
                    {t('sync.auto_description')}
                  </Text>
                </View>
                <Switch
                  value={syncState.autoSync}
                  onValueChange={handleToggleAutoSync}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                  thumbColor={syncState.autoSync ? theme.colors.primary : '#f4f3f4'}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.syncButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleManualSync}
              >
                <Icon name="sync" size={24} color="#FFFFFF" />
                <Text style={styles.syncButtonText}>{t('sync.manual')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {syncState.enabled && (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('sync.paired_devices')}
              </Text>
              {pairedDevices.map(renderDeviceItem)}

              {!isAddingDevice ? (
                <TouchableOpacity
                  style={[
                    styles.addDeviceButton,
                    { borderColor: theme.colors.primary },
                  ]}
                  onPress={() => setIsAddingDevice(true)}
                >
                  <Icon name="add" size={24} color={theme.colors.primary} />
                  <Text
                    style={[styles.addDeviceText, { color: theme.colors.primary }]}
                  >
                    {t('sync.add_device')}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={[
                    styles.addDeviceForm,
                    { backgroundColor: theme.colors.card },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.deviceCodeInput,
                      {
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    placeholder={t('sync.enter_device_code')}
                    placeholderTextColor={theme.colors.text + '80'}
                    value={deviceCode}
                    onChangeText={setDeviceCode}
                  />
                  <View style={styles.addDeviceButtons}>
                    <TouchableOpacity
                      style={[
                        styles.addDeviceActionButton,
                        { backgroundColor: theme.colors.error },
                      ]}
                      onPress={() => setIsAddingDevice(false)}
                    >
                      <Text style={styles.addDeviceActionButtonText}>
                        {t('cancel')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.addDeviceActionButton,
                        { backgroundColor: theme.colors.primary },
                      ]}
                      onPress={handleAddDevice}
                    >
                      <Text style={styles.addDeviceActionButtonText}>
                        {t('confirm')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('sync.conflict_resolution')}
              </Text>
              <View
                style={[
                  styles.conflictOptions,
                  { backgroundColor: theme.colors.card },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.conflictOption,
                    syncState.conflictResolution === 'manual' && {
                      borderColor: theme.colors.primary,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => handleConflictResolutionChange('manual')}
                >
                  <Icon
                    name="person"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[styles.conflictOptionText, { color: theme.colors.text }]}
                  >
                    {t('sync.conflict_manual')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.conflictOption,
                    syncState.conflictResolution === 'lastModified' && {
                      borderColor: theme.colors.primary,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => handleConflictResolutionChange('lastModified')}
                >
                  <Icon
                    name="update"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[styles.conflictOptionText, { color: theme.colors.text }]}
                  >
                    {t('sync.conflict_last_modified')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.conflictOption,
                    syncState.conflictResolution === 'devicePriority' && {
                      borderColor: theme.colors.primary,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => handleConflictResolutionChange('devicePriority')}
                >
                  <Icon
                    name="priority-high"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[styles.conflictOptionText, { color: theme.colors.text }]}
                  >
                    {t('sync.conflict_device_priority')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceDetails: {
    marginLeft: 16,
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  deviceStatus: {
    fontSize: 14,
    marginTop: 4,
  },
  lastSync: {
    fontSize: 12,
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  addDeviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addDeviceText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  addDeviceForm: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  deviceCodeInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  addDeviceButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  addDeviceActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addDeviceActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  conflictOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    gap: 16,
  },
  conflictOption: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  conflictOptionText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DeviceSyncScreen; 