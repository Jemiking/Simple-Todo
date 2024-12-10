import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Attachment, AttachmentFilter, AttachmentSortOptions, AttachmentMetadata } from '../types/attachment';
import { AttachmentService } from '../services/attachmentService';

interface AttachmentContextType {
  attachments: Attachment[];
  isLoading: boolean;
  error: string | null;
  pickAndAddAttachment: (todoId: string) => Promise<Attachment>;
  deleteAttachment: (attachmentId: string) => Promise<void>;
  openAttachment: (attachment: Attachment) => Promise<void>;
  shareAttachment: (attachment: Attachment) => Promise<void>;
  getAttachmentMetadata: (attachment: Attachment) => Promise<AttachmentMetadata>;
  getAttachments: (filter?: AttachmentFilter, sort?: AttachmentSortOptions) => Promise<Attachment[]>;
  refreshAttachments: () => Promise<void>;
}

const AttachmentContext = createContext<AttachmentContextType | undefined>(undefined);

export const AttachmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const attachmentService = AttachmentService.getInstance();

  useEffect(() => {
    initializeAttachmentService();
  }, []);

  const initializeAttachmentService = async () => {
    try {
      setIsLoading(true);
      await attachmentService.initialize();
      await refreshAttachments();
    } catch (err) {
      setError('初始化附件服务失败');
      console.error('初始化附件服务失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAttachments = async () => {
    try {
      const fetchedAttachments = await attachmentService.getAttachments();
      setAttachments(fetchedAttachments);
      setError(null);
    } catch (err) {
      setError('加载附件失败');
      console.error('加载附件失败:', err);
    }
  };

  const pickAndAddAttachment = async (todoId: string): Promise<Attachment> => {
    try {
      const pickerResult = await attachmentService.pickAttachment();
      if (pickerResult.type === 'cancel') {
        throw new Error('用户取消选择文件');
      }

      const attachment = await attachmentService.addAttachment(todoId, pickerResult);
      await refreshAttachments();
      return attachment;
    } catch (err) {
      setError('添加附件失败');
      throw err;
    }
  };

  const deleteAttachment = async (attachmentId: string) => {
    try {
      await attachmentService.deleteAttachment(attachmentId);
      await refreshAttachments();
    } catch (err) {
      setError('删除附件失败');
      throw err;
    }
  };

  const openAttachment = async (attachment: Attachment) => {
    try {
      await attachmentService.openAttachment(attachment);
    } catch (err) {
      setError('打开附件失败');
      throw err;
    }
  };

  const shareAttachment = async (attachment: Attachment) => {
    try {
      await attachmentService.shareAttachment(attachment);
    } catch (err) {
      setError('分享附件失败');
      throw err;
    }
  };

  const getAttachmentMetadata = async (attachment: Attachment) => {
    try {
      return await attachmentService.getAttachmentMetadata(attachment);
    } catch (err) {
      setError('获取附件元数据失败');
      throw err;
    }
  };

  const getAttachments = async (filter?: AttachmentFilter, sort?: AttachmentSortOptions) => {
    try {
      return await attachmentService.getAttachments(filter, sort);
    } catch (err) {
      setError('获取附件列表失败');
      throw err;
    }
  };

  return (
    <AttachmentContext.Provider
      value={{
        attachments,
        isLoading,
        error,
        pickAndAddAttachment,
        deleteAttachment,
        openAttachment,
        shareAttachment,
        getAttachmentMetadata,
        getAttachments,
        refreshAttachments,
      }}
    >
      {children}
    </AttachmentContext.Provider>
  );
};

export const useAttachment = () => {
  const context = useContext(AttachmentContext);
  if (!context) {
    throw new Error('useAttachment必须在AttachmentProvider内部使用');
  }
  return context;
}; 