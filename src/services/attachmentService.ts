import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
import { Attachment, AttachmentFilter, AttachmentSortOptions, AttachmentMetadata } from '../types/attachment';

const ATTACHMENT_STORAGE_KEY = '@attachments';
const ATTACHMENT_DIR = `${FileSystem.documentDirectory}attachments/`;

export class AttachmentService {
  private static instance: AttachmentService;
  private attachments: Attachment[] = [];

  private constructor() {}

  static getInstance(): AttachmentService {
    if (!AttachmentService.instance) {
      AttachmentService.instance = new AttachmentService();
    }
    return AttachmentService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // 确保附件目录存在
      const dirInfo = await FileSystem.getInfoAsync(ATTACHMENT_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(ATTACHMENT_DIR, { intermediates: true });
      }

      await this.loadAttachments();
    } catch (error) {
      console.error('初始化附件服务失败:', error);
      throw error;
    }
  }

  private async loadAttachments(): Promise<void> {
    try {
      const attachmentsJson = await AsyncStorage.getItem(ATTACHMENT_STORAGE_KEY);
      if (attachmentsJson) {
        const parsedAttachments = JSON.parse(attachmentsJson);
        this.attachments = parsedAttachments.map((attachment: any) => ({
          ...attachment,
          createdAt: new Date(attachment.createdAt),
          updatedAt: new Date(attachment.updatedAt),
        }));
      }
    } catch (error) {
      console.error('加载附件失败:', error);
      throw error;
    }
  }

  private async saveAttachments(): Promise<void> {
    try {
      const attachmentsJson = JSON.stringify(this.attachments);
      await AsyncStorage.setItem(ATTACHMENT_STORAGE_KEY, attachmentsJson);
    } catch (error) {
      console.error('保存附件失败:', error);
      throw error;
    }
  }

  private async generateThumbnail(uri: string, type: string): Promise<string | undefined> {
    try {
      if (type.startsWith('image/')) {
        const result = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 200 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
        return result.uri;
      }
      return undefined;
    } catch (error) {
      console.error('生成缩略图失败:', error);
      return undefined;
    }
  }

  private getFileType(mimeType: string): Attachment['type'] {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('application/pdf') || 
        mimeType.startsWith('application/msword') ||
        mimeType.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.') ||
        mimeType.startsWith('text/')) {
      return 'document';
    }
    return 'other';
  }

  async pickAttachment(): Promise<DocumentPicker.DocumentResult> {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.type === 'cancel') {
      throw new Error('用户取消选择文件');
    }

    return result;
  }

  async addAttachment(todoId: string, pickerResult: DocumentPicker.DocumentResult): Promise<Attachment> {
    if (pickerResult.type === 'cancel') {
      throw new Error('用户取消选择文件');
    }

    try {
      const fileUri = pickerResult.uri;
      const fileName = pickerResult.name;
      const mimeType = pickerResult.mimeType || 'application/octet-stream';
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      if (!fileInfo.exists) {
        throw new Error('文件不存在');
      }

      // 复制文件到应用目录
      const newFileName = `${Date.now()}_${fileName}`;
      const newFileUri = `${ATTACHMENT_DIR}${newFileName}`;
      await FileSystem.copyAsync({
        from: fileUri,
        to: newFileUri,
      });

      // 生成缩略图（如果是图片）
      const thumbnailUri = await this.generateThumbnail(fileUri, mimeType);

      const attachment: Attachment = {
        id: Date.now().toString(),
        todoId,
        name: fileName,
        type: this.getFileType(mimeType),
        uri: newFileUri,
        size: fileInfo.size || 0,
        mimeType,
        thumbnailUri,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.attachments.push(attachment);
      await this.saveAttachments();

      return attachment;
    } catch (error) {
      console.error('添加附件失败:', error);
      throw error;
    }
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    try {
      const attachment = this.attachments.find(a => a.id === attachmentId);
      if (!attachment) {
        throw new Error('附件不存在');
      }

      // 删除文件
      await FileSystem.deleteAsync(attachment.uri, { idempotent: true });

      // 删除缩略图
      if (attachment.thumbnailUri) {
        await FileSystem.deleteAsync(attachment.thumbnailUri, { idempotent: true });
      }

      // 更新状态
      this.attachments = this.attachments.filter(a => a.id !== attachmentId);
      await this.saveAttachments();
    } catch (error) {
      console.error('删除附件失败:', error);
      throw error;
    }
  }

  async getAttachment(attachmentId: string): Promise<Attachment | undefined> {
    return this.attachments.find(a => a.id === attachmentId);
  }

  async getAttachments(filter?: AttachmentFilter, sort?: AttachmentSortOptions): Promise<Attachment[]> {
    let filteredAttachments = [...this.attachments];

    // 应用过滤
    if (filter) {
      if (filter.todoId) {
        filteredAttachments = filteredAttachments.filter(a => a.todoId === filter.todoId);
      }
      if (filter.type) {
        filteredAttachments = filteredAttachments.filter(a => a.type === filter.type);
      }
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        filteredAttachments = filteredAttachments.filter(a =>
          a.name.toLowerCase().includes(searchLower)
        );
      }
    }

    // 应用排序
    if (sort) {
      filteredAttachments.sort((a, b) => {
        const aValue = a[sort.sortBy];
        const bValue = b[sort.sortBy];
        const compareResult = sort.sortDirection === 'asc' ? 1 : -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue) * compareResult;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          return (aValue.getTime() - bValue.getTime()) * compareResult;
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return (aValue - bValue) * compareResult;
        }
        return 0;
      });
    }

    return filteredAttachments;
  }

  async openAttachment(attachment: Attachment): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await FileSystem.openAsync(attachment.uri);
      } else {
        // Android需要先将文件复制到共享目录
        const tempDir = FileSystem.cacheDirectory + 'temp/';
        const dirInfo = await FileSystem.getInfoAsync(tempDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
        }

        const tempUri = `${tempDir}${attachment.name}`;
        await FileSystem.copyAsync({
          from: attachment.uri,
          to: tempUri,
        });

        await FileSystem.openAsync(tempUri);
      }
    } catch (error) {
      console.error('打开附件失败:', error);
      throw error;
    }
  }

  async shareAttachment(attachment: Attachment): Promise<void> {
    try {
      await FileSystem.shareAsync(attachment.uri, {
        mimeType: attachment.mimeType,
        dialogTitle: `分享${attachment.name}`,
      });
    } catch (error) {
      console.error('分享附件失败:', error);
      throw error;
    }
  }

  async getAttachmentMetadata(attachment: Attachment): Promise<AttachmentMetadata> {
    try {
      const metadata: AttachmentMetadata = {};

      if (attachment.type === 'image') {
        const asset = await MediaLibrary.createAssetAsync(attachment.uri);
        metadata.width = asset.width;
        metadata.height = asset.height;
      }

      return metadata;
    } catch (error) {
      console.error('获取附件元数据失败:', error);
      return {};
    }
  }
} 