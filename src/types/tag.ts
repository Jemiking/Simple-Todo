export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagGroup {
  id: string;
  name: string;
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TagFilter {
  tagIds?: string[];
  groupId?: string;
  searchText?: string;
}

export interface TagSortOptions {
  sortBy: 'name' | 'createdAt' | 'updatedAt';
  sortDirection: 'asc' | 'desc';
} 