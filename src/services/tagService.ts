import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tag, TagGroup, TagFilter, TagSortOptions } from '../types/tag';

const TAG_STORAGE_KEY = '@tags';
const TAG_GROUP_STORAGE_KEY = '@tag_groups';

export class TagService {
  private static instance: TagService;
  private tags: Tag[] = [];
  private tagGroups: TagGroup[] = [];

  private constructor() {}

  static getInstance(): TagService {
    if (!TagService.instance) {
      TagService.instance = new TagService();
    }
    return TagService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.loadTags();
      await this.loadTagGroups();
    } catch (error) {
      console.error('初始化标签服务失败:', error);
      throw error;
    }
  }

  private async loadTags(): Promise<void> {
    try {
      const tagsJson = await AsyncStorage.getItem(TAG_STORAGE_KEY);
      if (tagsJson) {
        const parsedTags = JSON.parse(tagsJson);
        this.tags = parsedTags.map((tag: any) => ({
          ...tag,
          createdAt: new Date(tag.createdAt),
          updatedAt: new Date(tag.updatedAt),
        }));
      }
    } catch (error) {
      console.error('加载标签失败:', error);
      throw error;
    }
  }

  private async loadTagGroups(): Promise<void> {
    try {
      const groupsJson = await AsyncStorage.getItem(TAG_GROUP_STORAGE_KEY);
      if (groupsJson) {
        const parsedGroups = JSON.parse(groupsJson);
        this.tagGroups = parsedGroups.map((group: any) => ({
          ...group,
          createdAt: new Date(group.createdAt),
          updatedAt: new Date(group.updatedAt),
        }));
      }
    } catch (error) {
      console.error('加载标签组失败:', error);
      throw error;
    }
  }

  private async saveTags(): Promise<void> {
    try {
      const tagsJson = JSON.stringify(this.tags);
      await AsyncStorage.setItem(TAG_STORAGE_KEY, tagsJson);
    } catch (error) {
      console.error('保存标签失败:', error);
      throw error;
    }
  }

  private async saveTagGroups(): Promise<void> {
    try {
      const groupsJson = JSON.stringify(this.tagGroups);
      await AsyncStorage.setItem(TAG_GROUP_STORAGE_KEY, groupsJson);
    } catch (error) {
      console.error('保存标签组失败:', error);
      throw error;
    }
  }

  // 标签CRUD操作
  async createTag(tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
    const newTag: Tag = {
      ...tag,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tags.push(newTag);
    await this.saveTags();
    return newTag;
  }

  async updateTag(tagId: string, updates: Partial<Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Tag> {
    const tagIndex = this.tags.findIndex(t => t.id === tagId);
    if (tagIndex === -1) {
      throw new Error('标签不存在');
    }

    const updatedTag = {
      ...this.tags[tagIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.tags[tagIndex] = updatedTag;
    await this.saveTags();
    return updatedTag;
  }

  async deleteTag(tagId: string): Promise<void> {
    this.tags = this.tags.filter(t => t.id !== tagId);
    await this.saveTags();
  }

  async getTag(tagId: string): Promise<Tag | undefined> {
    return this.tags.find(t => t.id === tagId);
  }

  // 标签组CRUD操作
  async createTagGroup(group: Omit<TagGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<TagGroup> {
    const newGroup: TagGroup = {
      ...group,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tagGroups.push(newGroup);
    await this.saveTagGroups();
    return newGroup;
  }

  async updateTagGroup(groupId: string, updates: Partial<Omit<TagGroup, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TagGroup> {
    const groupIndex = this.tagGroups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) {
      throw new Error('标签组不存在');
    }

    const updatedGroup = {
      ...this.tagGroups[groupIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.tagGroups[groupIndex] = updatedGroup;
    await this.saveTagGroups();
    return updatedGroup;
  }

  async deleteTagGroup(groupId: string): Promise<void> {
    this.tagGroups = this.tagGroups.filter(g => g.id !== groupId);
    await this.saveTagGroups();
  }

  async getTagGroup(groupId: string): Promise<TagGroup | undefined> {
    return this.tagGroups.find(g => g.id === groupId);
  }

  // 查询和过滤
  async getTags(filter?: TagFilter, sort?: TagSortOptions): Promise<Tag[]> {
    let filteredTags = [...this.tags];

    // 应用过滤
    if (filter) {
      if (filter.tagIds) {
        filteredTags = filteredTags.filter(tag => filter.tagIds!.includes(tag.id));
      }
      if (filter.groupId) {
        const group = this.tagGroups.find(g => g.id === filter.groupId);
        if (group) {
          filteredTags = filteredTags.filter(tag => group.tags.some(t => t.id === tag.id));
        }
      }
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        filteredTags = filteredTags.filter(tag =>
          tag.name.toLowerCase().includes(searchLower) ||
          tag.description?.toLowerCase().includes(searchLower)
        );
      }
    }

    // 应用排序
    if (sort) {
      filteredTags.sort((a, b) => {
        const aValue = a[sort.sortBy];
        const bValue = b[sort.sortBy];
        const compareResult = sort.sortDirection === 'asc' ? 1 : -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue) * compareResult;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          return (aValue.getTime() - bValue.getTime()) * compareResult;
        }
        return 0;
      });
    }

    return filteredTags;
  }

  async getTagGroups(): Promise<TagGroup[]> {
    return [...this.tagGroups];
  }

  // 标签组管理
  async addTagToGroup(tagId: string, groupId: string): Promise<void> {
    const group = this.tagGroups.find(g => g.id === groupId);
    const tag = this.tags.find(t => t.id === tagId);

    if (!group || !tag) {
      throw new Error('标签或标签组不存在');
    }

    if (!group.tags.some(t => t.id === tagId)) {
      group.tags.push(tag);
      group.updatedAt = new Date();
      await this.saveTagGroups();
    }
  }

  async removeTagFromGroup(tagId: string, groupId: string): Promise<void> {
    const group = this.tagGroups.find(g => g.id === groupId);
    if (!group) {
      throw new Error('标签组不存在');
    }

    group.tags = group.tags.filter(t => t.id !== tagId);
    group.updatedAt = new Date();
    await this.saveTagGroups();
  }
} 