import React, { memo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { BackupService } from '../services/backupService';
import AnimatedView from '../components/AnimatedView';
import EmptyState from '../components/EmptyState';

interface BackupItem {
  name: string;
  path: string;
  timestamp: Date;
}

const BackupScreen: React.FC = () => {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // 加载备份列表
  const loadBackups = useCallback(async () => {
    try {
      setIsLoading(true);
      await BackupService.initialize();
      const list = await BackupService.getBackupList();
      setBackups(list);
    } catch (error) {
      console.error('Error loading backups:', error);
      Alert.alert('错误', '加载备份列��失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadBackups();
  }, [loadBackups]);

  // 创建备份
  const handleCreateBackup = useCallback(async () => {
    try {
      setIsCreating(true);
      await BackupService.createBackup();
      await loadBackups();
      Alert.alert('成功', '备份创建成功');
    } catch (error) {
      console.error('Error creating backup:', error);
      Alert.alert('错误', '创建备份失败');
    } finally {
      setIsCreating(false);
    }
  }, [loadBackups]);

  // 恢复备份
  const handleRestoreBackup = useCallback(async (backup: BackupItem) => {
    Alert.alert(
      '确认恢复',
      '恢复备份将覆盖当前所有数据，确定要继续吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '恢复',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsRestoring(true);
              await BackupService.restoreBackup(backup.path);
              Alert.alert('成功', '备份恢复成功');
            } catch (error) {
              console.error('Error restoring backup:', error);
              Alert.alert('错误', '恢复备份失败');
            } finally {
              setIsRestoring(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, []);

  // 删除备份
  const handleDeleteBackup = useCallback(async (backup: BackupItem) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个备份吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await BackupService.deleteBackup(backup.path);
              await loadBackups();
              Alert.alert('成功', '备份删除成功');
            } catch (error) {
              console.error('Error deleting backup:', error);
              Alert.alert('错误', '删除备份失败');
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [loadBackups]);

  // 导出备份
  const handleExportBackup = useCallback(async (backup: BackupItem) => {
    try {
      await BackupService.exportBackup(backup.path);
      Alert.alert('成功', '备份导出成功');
    } catch (error) {
      console.error('Error exporting backup:', error);
      Alert.alert('错误', '导出备份失败');
    }
  }, []);

  // 渲染备份项
  const renderBackupItem = useCallback(({ item, index }: { item: BackupItem; index: number }) => (
    <AnimatedView
      animation="fade"
      delay={index * 100}
      style={styles.backupItem}
    >
      <View style={styles.backupInfo}>
        <Text style={styles.backupDate}>
          {format(item.timestamp, 'yyyy-MM-dd HH:mm:ss')}
        </Text>
        <Text style={styles.backupName}>{item.name}</Text>
      </View>
      <View style={styles.backupActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRestoreBackup(item)}
          disabled={isRestoring}
        >
          <MaterialIcons
            name="restore"
            size={24}
            color={isRestoring ? '#bdbdbd' : '#2196F3'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleExportBackup(item)}
        >
          <MaterialIcons name="share" size={24} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteBackup(item)}
        >
          <MaterialIcons name="delete" size={24} color="#f44336" />
        </TouchableOpacity>
      </View>
    </AnimatedView>
  ), [handleRestoreBackup, handleExportBackup, handleDeleteBackup, isRestoring]);

  // 渲染空状态
  const renderEmptyState = useCallback(() => (
    <EmptyState
      title="暂无备份"
      description="点击右上角按钮创建新的备份"
      icon="backup"
    />
  ), []);

  return (
    <View style={styles.container}>
      <FlatList
        data={backups}
        renderItem={renderBackupItem}
        keyExtractor={item => item.path}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!isLoading && renderEmptyState()}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      )}

      <TouchableOpacity
        style={[styles.fab, isCreating && styles.fabDisabled]}
        onPress={handleCreateBackup}
        disabled={isCreating}
      >
        {isCreating ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <MaterialIcons name="backup" size={24} color="white" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  backupItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backupInfo: {
    flex: 1,
  },
  backupDate: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 4,
  },
  backupName: {
    fontSize: 14,
    color: '#757575',
  },
  backupActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabDisabled: {
    backgroundColor: '#bdbdbd',
  },
});

export default memo(BackupScreen); 