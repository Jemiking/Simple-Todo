import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useVersion } from '../contexts/VersionContext';
import { useI18n } from '../contexts/I18nContext';
import { useTodo } from '../contexts/TodoContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Version, VersionDiff } from '../services/versionHistoryService';

const VersionHistoryScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { versions, config, updateConfig, deleteVersion, compareVersions, rollbackToVersion } = useVersion();
  const { updateTodos } = useTodo();

  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersion, setCompareVersion] = useState<Version | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [diffs, setDiffs] = useState<VersionDiff[]>([]);

  const handleToggleEnabled = async (value: boolean) => {
    try {
      await updateConfig({ enabled: value });
    } catch (error) {
      console.error('更新版本历史设置失败:', error);
      Alert.alert(t('error.unknown'));
    }
  };

  const handleToggleAutoCleanup = async (value: boolean) => {
    try {
      await updateConfig({ autoCleanup: value });
    } catch (error) {
      console.error('更新自动清理设置失败:', error);
      Alert.alert(t('error.unknown'));
    }
  };

  const handleDeleteVersion = async (version: Version) => {
    Alert.alert(
      t('confirm'),
      t('version.delete_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVersion(version.id);
              setSelectedVersion(null);
            } catch (error) {
              console.error('删除版本失败:', error);
              Alert.alert(t('error.unknown'));
            }
          },
        },
      ]
    );
  };

  const handleCompare = (version: Version) => {
    if (!compareMode) {
      setCompareMode(true);
      setCompareVersion(version);
    } else {
      const diffs = compareVersions(compareVersion!.id, version.id);
      setDiffs(diffs);
      setShowDiff(true);
      setCompareMode(false);
      setCompareVersion(null);
    }
  };

  const handleRollback = async (version: Version) => {
    Alert.alert(
      t('confirm'),
      t('version.rollback_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('confirm'),
          onPress: async () => {
            try {
              const todos = await rollbackToVersion(version.id);
              await updateTodos(todos);
              Alert.alert(t('success'), t('version.rollback_success'));
            } catch (error) {
              console.error('回滚版本失败:', error);
              Alert.alert(t('error.unknown'));
            }
          },
        },
      ]
    );
  };

  const renderVersionItem = (version: Version) => (
    <TouchableOpacity
      key={version.id}
      style={[
        styles.versionItem,
        {
          backgroundColor: theme.colors.card,
          borderColor: compareVersion?.id === version.id ? theme.colors.primary : theme.colors.border,
          borderWidth: compareVersion?.id === version.id ? 2 : 1,
        },
      ]}
      onPress={() => setSelectedVersion(version)}
    >
      <View style={styles.versionHeader}>
        <Text style={[styles.versionTimestamp, { color: theme.colors.text }]}>
          {version.timestamp.toLocaleString()}
        </Text>
        <View style={styles.versionActions}>
          {compareMode ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => handleCompare(version)}
            >
              <Text style={styles.actionButtonText}>{t('version.select_to_compare')}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: theme.colors.primary + '20' }]}
                onPress={() => handleCompare(version)}
              >
                <Icon name="compare" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: theme.colors.warning + '20' }]}
                onPress={() => handleRollback(version)}
              >
                <Icon name="restore" size={20} color={theme.colors.warning} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: theme.colors.error + '20' }]}
                onPress={() => handleDeleteVersion(version)}
              >
                <Icon name="delete" size={20} color={theme.colors.error} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      <Text style={[styles.versionDescription, { color: theme.colors.text }]}>
        {version.description}
      </Text>
      <View style={styles.changesSummary}>
        {version.changes.length > 0 && (
          <Text style={[styles.changesCount, { color: theme.colors.text + '80' }]}>
            {t('version.changes_count', { count: version.changes.length })}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderDiffModal = () => (
    <Modal
      visible={showDiff}
      transparent
      animationType="fade"
      onRequestClose={() => setShowDiff(false)}
    >
      <TouchableOpacity
        style={[styles.modalOverlay, { backgroundColor: theme.colors.background + 'E6' }]}
        onPress={() => setShowDiff(false)}
      >
        <View
          style={[styles.diffModal, { backgroundColor: theme.colors.card }]}
        >
          <View style={styles.diffHeader}>
            <Text style={[styles.diffTitle, { color: theme.colors.text }]}>
              {t('version.changes')}
            </Text>
            <TouchableOpacity onPress={() => setShowDiff(false)}>
              <Icon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.diffContent}>
            {diffs.map((diff, index) => (
              <View
                key={index}
                style={[
                  styles.diffItem,
                  { borderBottomColor: theme.colors.border },
                ]}
              >
                <View style={styles.diffType}>
                  <Icon
                    name={
                      diff.type === 'create'
                        ? 'add-circle'
                        : diff.type === 'update'
                        ? 'edit'
                        : 'remove-circle'
                    }
                    size={20}
                    color={
                      diff.type === 'create'
                        ? theme.colors.success
                        : diff.type === 'update'
                        ? theme.colors.warning
                        : theme.colors.error
                    }
                  />
                  <Text
                    style={[
                      styles.diffTypeText,
                      { color: theme.colors.text },
                    ]}
                  >
                    {t(`version.change_type.${diff.type}`)}
                  </Text>
                </View>
                {diff.type === 'update' ? (
                  <>
                    <Text style={[styles.diffLabel, { color: theme.colors.text + '80' }]}>
                      {t('version.before')}:
                    </Text>
                    <Text style={[styles.diffValue, { color: theme.colors.error }]}>
                      {diff.before?.title}
                    </Text>
                    <Text style={[styles.diffLabel, { color: theme.colors.text + '80' }]}>
                      {t('version.after')}:
                    </Text>
                    <Text style={[styles.diffValue, { color: theme.colors.success }]}>
                      {diff.after?.title}
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.diffValue, { color: theme.colors.text }]}>
                    {(diff.type === 'create' ? diff.after : diff.before)?.title}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
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
                {t('version.enable')}
              </Text>
              <Text
                style={[styles.settingDescription, { color: theme.colors.text + '80' }]}
              >
                {t('version.enable_description')}
              </Text>
            </View>
            <Switch
              value={config.enabled}
              onValueChange={handleToggleEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
              thumbColor={config.enabled ? theme.colors.primary : '#f4f3f4'}
            />
          </View>

          {config.enabled && (
            <View
              style={[
                styles.settingItem,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  {t('version.auto_cleanup')}
                </Text>
                <Text
                  style={[styles.settingDescription, { color: theme.colors.text + '80' }]}
                >
                  {t('version.auto_cleanup_description')}
                </Text>
              </View>
              <Switch
                value={config.autoCleanup}
                onValueChange={handleToggleAutoCleanup}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                thumbColor={config.autoCleanup ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
          )}
        </View>

        {config.enabled && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('version.history')}
              </Text>
              {compareMode && (
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: theme.colors.error }]}
                  onPress={() => {
                    setCompareMode(false);
                    setCompareVersion(null);
                  }}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.colors.error }]}>
                    {t('version.cancel_compare')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {versions.map(renderVersionItem)}
          </View>
        )}
      </ScrollView>

      {renderDiffModal()}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
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
  versionItem: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  versionTimestamp: {
    fontSize: 14,
    fontWeight: '500',
  },
  versionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  versionDescription: {
    fontSize: 16,
    marginBottom: 8,
  },
  changesSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changesCount: {
    fontSize: 14,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  diffModal: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 16,
  },
  diffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  diffTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  diffContent: {
    flex: 1,
  },
  diffItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  diffType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  diffTypeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  diffLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  diffValue: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default VersionHistoryScreen; 