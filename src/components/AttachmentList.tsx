import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAttachment } from '../contexts/AttachmentContext';
import { Attachment } from '../types/attachment';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatBytes } from '../utils/fileUtils';

interface AttachmentListProps {
  todoId: string;
  onAttachmentAdded?: (attachment: Attachment) => void;
  onAttachmentDeleted?: (attachmentId: string) => void;
}

const AttachmentList: React.FC<AttachmentListProps> = ({
  todoId,
  onAttachmentAdded,
  onAttachmentDeleted,
}) => {
  const { theme } = useTheme();
  const {
    attachments,
    isLoading,
    error,
    pickAndAddAttachment,
    deleteAttachment,
    openAttachment,
    shareAttachment,
    getAttachments,
  } = useAttachment();

  const [todoAttachments, setTodoAttachments] = useState<Attachment[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadTodoAttachments();
  }, [todoId, attachments]);

  const loadTodoAttachments = async () => {
    try {
      const filteredAttachments = await getAttachments(
        { todoId },
        { sortBy: 'createdAt', sortDirection: 'desc' }
      );
      setTodoAttachments(filteredAttachments);
    } catch (err) {
      console.error('加载附件失败:', err);
    }
  };

  const handleAddAttachment = async () => {
    try {
      setIsAdding(true);
      const attachment = await pickAndAddAttachment(todoId);
      onAttachmentAdded?.(attachment);
    } catch (err) {
      if (err.message !== '用户取消选择文件') {
        Alert.alert('错误', '添加附件失败');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteAttachment = async (attachment: Attachment) => {
    Alert.alert(
      '删除附件',
      `确定要删除附件"${attachment.name}"吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAttachment(attachment.id);
              onAttachmentDeleted?.(attachment.id);
            } catch (err) {
              Alert.alert('错误', '删除附件失败');
            }
          },
        },
      ]
    );
  };

  const handleOpenAttachment = async (attachment: Attachment) => {
    try {
      await openAttachment(attachment);
    } catch (err) {
      Alert.alert('错误', '打开附件失败');
    }
  };

  const handleShareAttachment = async (attachment: Attachment) => {
    try {
      await shareAttachment(attachment);
    } catch (err) {
      Alert.alert('错误', '分享附件失败');
    }
  };

  const renderAttachmentIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image':
        return 'image';
      case 'video':
        return 'videocam';
      case 'audio':
        return 'audiotrack';
      case 'document':
        return 'description';
      default:
        return 'insert-drive-file';
    }
  };

  const renderAttachment = (attachment: Attachment) => (
    <View
      key={attachment.id}
      style={[
        styles.attachmentItem,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
    >
      <TouchableOpacity
        style={styles.attachmentContent}
        onPress={() => handleOpenAttachment(attachment)}
      >
        {attachment.type === 'image' && attachment.thumbnailUri ? (
          <Image
            source={{ uri: attachment.thumbnailUri }}
            style={styles.thumbnail}
          />
        ) : (
          <Icon
            name={renderAttachmentIcon(attachment.type)}
            size={40}
            color={theme.colors.primary}
          />
        )}
        <View style={styles.attachmentInfo}>
          <Text
            style={[styles.attachmentName, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {attachment.name}
          </Text>
          <Text
            style={[styles.attachmentSize, { color: theme.colors.text + '80' }]}
          >
            {formatBytes(attachment.size)}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.attachmentActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShareAttachment(attachment)}
        >
          <Icon name="share" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteAttachment(attachment)}
        >
          <Icon name="delete" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>附件</Text>
        <TouchableOpacity
          style={[styles.addButton, { borderColor: theme.colors.border }]}
          onPress={handleAddAttachment}
          disabled={isAdding}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Icon name="add" size={24} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : todoAttachments.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.text + '80' }]}>
            暂无附件
          </Text>
        </View>
      ) : (
        <View style={styles.attachmentList}>
          {todoAttachments.map(renderAttachment)}
        </View>
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
  centerContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
  },
  attachmentList: {
    marginTop: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  attachmentContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
  },
  attachmentSize: {
    fontSize: 12,
    marginTop: 2,
  },
  attachmentActions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
  },
}); 