export enum TodoPriority {
  High = 1,
  Medium = 2,
  Low = 3,
}

export enum RepeatType {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Yearly = 'yearly',
  Custom = 'custom',
}

export interface RepeatConfig {
  type: RepeatType;
  interval: number; // 重复间隔，例如每2天、每3周等
  weekDays?: number[]; // 用于每周重复，0-6表示周日到周六
  monthDay?: number; // 用于每月重复，1-31
  endDate?: Date; // 重复结束日期
  endTimes?: number; // 重复次数
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority?: TodoPriority;
  subTasks: SubTask[];
  repeat?: RepeatConfig;
  categoryId?: string;
  tagIds: string[];
  attachmentIds: string[];
  reminderId?: string;
  reminderTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Todo项过滤类型
export type TodoFilter = {
  completed?: boolean;
  categoryId?: string;
  priority?: TodoPriority;
  tagIds?: string[];
  hasAttachments?: boolean;
};

// Todo项排序类型
export type TodoSortBy = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';

// Todo项排序方向
export type TodoSortDirection = 'asc' | 'desc'; 