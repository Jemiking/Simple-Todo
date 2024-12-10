import { Todo } from '../types/todo';

export interface SearchOptions {
  query: string;
  includeCompleted?: boolean;
  categoryId?: string;
  tagIds?: string[];
  priority?: number;
  startDate?: Date;
  endDate?: Date;
}

export class SearchService {
  // 搜索Todo项
  static searchTodos(todos: Todo[], options: SearchOptions): Todo[] {
    const {
      query,
      includeCompleted = true,
      categoryId,
      tagIds,
      priority,
      startDate,
      endDate,
    } = options;

    // 转换查询字符串为小写以进行不区分大小写的搜索
    const lowercaseQuery = query.toLowerCase();

    return todos.filter(todo => {
      // 如果不包含已完成的Todo，且当前Todo已完成，则过滤掉
      if (!includeCompleted && todo.completed) {
        return false;
      }

      // 如果指定了分类，且当前Todo不属于该分类，则过滤掉
      if (categoryId && todo.categoryId !== categoryId) {
        return false;
      }

      // 如果指定了标签，且当前Todo不包含所有指定的标签，则过滤掉
      if (tagIds && tagIds.length > 0) {
        if (!tagIds.every(tagId => todo.tagIds.includes(tagId))) {
          return false;
        }
      }

      // 如果指定了优先级，且当前Todo的优先级不匹配，则过滤掉
      if (priority !== undefined && todo.priority !== priority) {
        return false;
      }

      // 如果指定了开始日期，且当前Todo的截止日期早于开始日期，则过滤掉
      if (startDate && todo.dueDate && todo.dueDate < startDate) {
        return false;
      }

      // 如果指定了结束日期，且当前Todo的截止日期晚于结束日期，则过滤掉
      if (endDate && todo.dueDate && todo.dueDate > endDate) {
        return false;
      }

      // 搜索标题
      if (todo.title.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }

      // 搜索描述
      if (todo.description?.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }

      // 搜索子任务
      if (todo.subTasks.some(subTask =>
        subTask.title.toLowerCase().includes(lowercaseQuery)
      )) {
        return true;
      }

      return false;
    });
  }

  // 高亮搜索结果
  static highlightSearchResults(text: string, query: string): string[] {
    if (!query) {
      return [text];
    }

    const lowercaseText = text.toLowerCase();
    const lowercaseQuery = query.toLowerCase();
    const parts: string[] = [];
    let lastIndex = 0;

    while (true) {
      const index = lowercaseText.indexOf(lowercaseQuery, lastIndex);
      if (index === -1) {
        parts.push(text.slice(lastIndex));
        break;
      }

      parts.push(text.slice(lastIndex, index));
      parts.push(text.slice(index, index + query.length));
      lastIndex = index + query.length;
    }

    return parts;
  }
} 