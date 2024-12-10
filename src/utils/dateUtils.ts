import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  isThisWeek,
  isThisMonth,
  differenceInDays,
  addDays,
  startOfDay,
  endOfDay,
  parseISO,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

export class DateUtils {
  // 格式化日期显示
  static formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (isToday(dateObj)) {
      return '今天';
    }
    if (isTomorrow(dateObj)) {
      return '明天';
    }
    if (isYesterday(dateObj)) {
      return '昨天';
    }
    if (isThisWeek(dateObj)) {
      return format(dateObj, 'EEEE', { locale: zhCN });
    }
    if (isThisMonth(dateObj)) {
      return format(dateObj, 'M月d日');
    }
    return format(dateObj, 'yyyy年M月d日');
  }

  // 格式化时间显示
  static formatTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'HH:mm');
  }

  // 格式化完整日期时间
  static formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return `${this.formatDate(dateObj)} ${this.formatTime(dateObj)}`;
  }

  // 获取相对时间描述
  static getRelativeTimeDescription(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const days = differenceInDays(dateObj, now);

    if (days === 0) {
      return '今天';
    }
    if (days === 1) {
      return '明天';
    }
    if (days === -1) {
      return '昨天';
    }
    if (days > 0 && days <= 7) {
      return `${days}天后`;
    }
    if (days < 0 && days >= -7) {
      return `${Math.abs(days)}天前`;
    }
    return this.formatDate(dateObj);
  }

  // 获取截止日期状态
  static getDueDateStatus(dueDate: Date | string): 'overdue' | 'today' | 'upcoming' | 'future' {
    const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    const now = new Date();
    const days = differenceInDays(dateObj, now);

    if (days < 0) {
      return 'overdue';
    }
    if (isToday(dateObj)) {
      return 'today';
    }
    if (days <= 7) {
      return 'upcoming';
    }
    return 'future';
  }

  // 获取一天的开始时间
  static getStartOfDay(date: Date | string): Date {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return startOfDay(dateObj);
  }

  // 获取一天的结束时间
  static getEndOfDay(date: Date | string): Date {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return endOfDay(dateObj);
  }

  // 添加天数
  static addDays(date: Date | string, days: number): Date {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return addDays(dateObj, days);
  }

  // 检查日期是否有效
  static isValidDate(date: any): boolean {
    if (!date) return false;
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  }
} 