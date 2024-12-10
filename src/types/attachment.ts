export interface Attachment {
  id: string;
  todoId: string;
  name: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'other';
  uri: string;
  size: number;
  mimeType: string;
  thumbnailUri?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttachmentFilter {
  todoId?: string;
  type?: Attachment['type'];
  searchText?: string;
}

export interface AttachmentSortOptions {
  sortBy: 'name' | 'size' | 'createdAt' | 'updatedAt';
  sortDirection: 'asc' | 'desc';
}

export interface AttachmentMetadata {
  width?: number;
  height?: number;
  duration?: number;
  pageCount?: number;
} 