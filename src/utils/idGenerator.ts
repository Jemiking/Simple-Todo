import { v4 as uuidv4 } from 'uuid';

export class IdGenerator {
  // 生成UUID
  static generateUUID(): string {
    return uuidv4();
  }

  // 生成时间戳ID
  static generateTimeBasedId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 生成指定长度的随机字符串ID
  static generateRandomId(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 生成带前缀的ID
  static generatePrefixedId(prefix: string): string {
    return `${prefix}-${this.generateTimeBasedId()}`;
  }

  // 生成递增ID（不保证全局唯一，仅用于临时标识）
  private static counter = 0;
  static generateIncrementalId(prefix: string = 'id'): string {
    this.counter += 1;
    return `${prefix}-${this.counter}`;
  }

  // 生成短ID（用于显示）
  static generateShortId(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  // 检查ID是否为有效的UUID
  static isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }
} 