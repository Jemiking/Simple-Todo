import React, { createContext, useContext, useEffect, useState } from 'react';
import { Tag, TagGroup, TagFilter, TagSortOptions } from '../types/tag';
import { TagService } from '../services/tagService';

interface TagContextType {
  tags: Tag[];
  tagGroups: TagGroup[];
  isLoading: boolean;
  error: string | null;
  createTag: (tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Tag>;
  updateTag: (tagId: string, updates: Partial<Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Tag>;
  deleteTag: (tagId: string) => Promise<void>;
  createTagGroup: (group: Omit<TagGroup, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TagGroup>;
  updateTagGroup: (groupId: string, updates: Partial<Omit<TagGroup, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<TagGroup>;
  deleteTagGroup: (groupId: string) => Promise<void>;
  addTagToGroup: (tagId: string, groupId: string) => Promise<void>;
  removeTagFromGroup: (tagId: string, groupId: string) => Promise<void>;
  filterTags: (filter?: TagFilter, sort?: TagSortOptions) => Promise<Tag[]>;
  refreshTags: () => Promise<void>;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

export const TagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tagService = TagService.getInstance();

  useEffect(() => {
    initializeTagService();
  }, []);

  const initializeTagService = async () => {
    try {
      setIsLoading(true);
      await tagService.initialize();
      await refreshTags();
    } catch (err) {
      setError('初始化标签服务失败');
      console.error('初始化标签服务失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTags = async () => {
    try {
      const [fetchedTags, fetchedGroups] = await Promise.all([
        tagService.getTags(),
        tagService.getTagGroups(),
      ]);
      setTags(fetchedTags);
      setTagGroups(fetchedGroups);
      setError(null);
    } catch (err) {
      setError('加载标签失败');
      console.error('加载标签失败:', err);
    }
  };

  const createTag = async (tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTag = await tagService.createTag(tag);
      await refreshTags();
      return newTag;
    } catch (err) {
      setError('创建标签失败');
      throw err;
    }
  };

  const updateTag = async (tagId: string, updates: Partial<Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const updatedTag = await tagService.updateTag(tagId, updates);
      await refreshTags();
      return updatedTag;
    } catch (err) {
      setError('更新标签失败');
      throw err;
    }
  };

  const deleteTag = async (tagId: string) => {
    try {
      await tagService.deleteTag(tagId);
      await refreshTags();
    } catch (err) {
      setError('删除标签失败');
      throw err;
    }
  };

  const createTagGroup = async (group: Omit<TagGroup, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newGroup = await tagService.createTagGroup(group);
      await refreshTags();
      return newGroup;
    } catch (err) {
      setError('创建标签组失败');
      throw err;
    }
  };

  const updateTagGroup = async (groupId: string, updates: Partial<Omit<TagGroup, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const updatedGroup = await tagService.updateTagGroup(groupId, updates);
      await refreshTags();
      return updatedGroup;
    } catch (err) {
      setError('更新标签组失败');
      throw err;
    }
  };

  const deleteTagGroup = async (groupId: string) => {
    try {
      await tagService.deleteTagGroup(groupId);
      await refreshTags();
    } catch (err) {
      setError('删除标签组失败');
      throw err;
    }
  };

  const addTagToGroup = async (tagId: string, groupId: string) => {
    try {
      await tagService.addTagToGroup(tagId, groupId);
      await refreshTags();
    } catch (err) {
      setError('添加标签到组失败');
      throw err;
    }
  };

  const removeTagFromGroup = async (tagId: string, groupId: string) => {
    try {
      await tagService.removeTagFromGroup(tagId, groupId);
      await refreshTags();
    } catch (err) {
      setError('从组中移除标签失败');
      throw err;
    }
  };

  const filterTags = async (filter?: TagFilter, sort?: TagSortOptions) => {
    try {
      return await tagService.getTags(filter, sort);
    } catch (err) {
      setError('过滤标签失败');
      throw err;
    }
  };

  return (
    <TagContext.Provider
      value={{
        tags,
        tagGroups,
        isLoading,
        error,
        createTag,
        updateTag,
        deleteTag,
        createTagGroup,
        updateTagGroup,
        deleteTagGroup,
        addTagToGroup,
        removeTagFromGroup,
        filterTags,
        refreshTags,
      }}
    >
      {children}
    </TagContext.Provider>
  );
};

export const useTag = () => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error('useTag必须在TagProvider内部使用');
  }
  return context;
}; 