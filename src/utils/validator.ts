import { Todo } from '../types/todo';
import { DateUtils } from './dateUtils';

export class Validator {
  // Todo项验证规则
  static todoRules = {
    title: {
      required: true,
      minLength: 1,
      maxLength: 100,
    },
    description: {
      maxLength: 500,
    },
    dueDate: {
      minDate: new Date(),
    },
    priority: {
      min: 1,
      max: 3,
    },
  };

  // 验证字符串
  static validateString(value: string, rules: { required?: boolean; minLength?: number; maxLength?: number }): string[] {
    const errors: string[] = [];

    if (rules.required && !value) {
      errors.push('此字段不能为空');
    }

    if (value) {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`长度不能少于 ${rules.minLength} 个字符`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`长度不能超过 ${rules.maxLength} 个字符`);
      }
    }

    return errors;
  }

  // 验证日期
  static validateDate(date: Date | undefined, rules: { required?: boolean; minDate?: Date }): string[] {
    const errors: string[] = [];

    if (rules.required && !date) {
      errors.push('日期不能为空');
    }

    if (date) {
      if (!DateUtils.isValidDate(date)) {
        errors.push('无效的日期格式');
      }

      if (rules.minDate && date < rules.minDate) {
        errors.push('日期不能早于当前时间');
      }
    }

    return errors;
  }

  // 验证数字
  static validateNumber(value: number | undefined, rules: { required?: boolean; min?: number; max?: number }): string[] {
    const errors: string[] = [];

    if (rules.required && value === undefined) {
      errors.push('此字段不能为空');
    }

    if (value !== undefined) {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`数值不能小于 ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`数值不能大于 ${rules.max}`);
      }
    }

    return errors;
  }

  // 验证Todo项
  static validateTodo(todo: Partial<Todo>): { [key: string]: string[] } {
    const errors: { [key: string]: string[] } = {};

    // 验证标题
    const titleErrors = this.validateString(todo.title || '', this.todoRules.title);
    if (titleErrors.length > 0) {
      errors.title = titleErrors;
    }

    // 验证描述
    if (todo.description) {
      const descriptionErrors = this.validateString(todo.description, this.todoRules.description);
      if (descriptionErrors.length > 0) {
        errors.description = descriptionErrors;
      }
    }

    // 验证截止日期
    if (todo.dueDate) {
      const dueDateErrors = this.validateDate(todo.dueDate, this.todoRules.dueDate);
      if (dueDateErrors.length > 0) {
        errors.dueDate = dueDateErrors;
      }
    }

    // 验证优先级
    if (todo.priority !== undefined) {
      const priorityErrors = this.validateNumber(todo.priority, this.todoRules.priority);
      if (priorityErrors.length > 0) {
        errors.priority = priorityErrors;
      }
    }

    return errors;
  }

  // 检查Todo项是否有效
  static isValidTodo(todo: Partial<Todo>): boolean {
    const errors = this.validateTodo(todo);
    return Object.keys(errors).length === 0;
  }

  // 格式化错误消息
  static formatErrors(errors: { [key: string]: string[] }): string {
    return Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n');
  }
} 