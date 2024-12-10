import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Todo } from '../types/todo';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReminderConfig {
  id: string;
  todoId: string;
  time: Date;
  type: 'once' | 'repeat';
  repeatInterval?: number; // 重复间隔（分钟）
  repeatDays?: number[]; // 重复的星期几（0-6）
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationService {
  private static instance: NotificationService;
  private reminders: ReminderConfig[] = [];

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // 初始化通知服务
  async initialize(): Promise<void> {
    // 请求通知权限
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      throw new Error('未获得通知权限');
    }

    // 配置通知行为
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // 针对Android配置通知通道
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2196F3',
      });
    }

    // 加载已保存的提醒配置
    await this.loadReminders();
  }

  // 加载提醒配置
  private async loadReminders(): Promise<void> {
    try {
      const remindersJson = await AsyncStorage.getItem('@reminders');
      if (remindersJson) {
        const parsedReminders = JSON.parse(remindersJson);
        this.reminders = parsedReminders.map((reminder: any) => ({
          ...reminder,
          time: new Date(reminder.time),
          createdAt: new Date(reminder.createdAt),
          updatedAt: new Date(reminder.updatedAt),
        }));
      }
    } catch (error) {
      console.error('加载提醒配置失败:', error);
      throw error;
    }
  }

  // 保存提醒配置
  private async saveReminders(): Promise<void> {
    try {
      const remindersJson = JSON.stringify(this.reminders);
      await AsyncStorage.setItem('@reminders', remindersJson);
    } catch (error) {
      console.error('保存提醒配置失败:', error);
      throw error;
    }
  }

  // 创建提醒
  async createReminder(config: Omit<ReminderConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReminderConfig> {
    const reminder: ReminderConfig = {
      ...config,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.reminders.push(reminder);
    await this.saveReminders();

    if (reminder.enabled) {
      await this.scheduleReminder(reminder);
    }

    return reminder;
  }

  // 更新提醒
  async updateReminder(reminderId: string, updates: Partial<Omit<ReminderConfig, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ReminderConfig> {
    const index = this.reminders.findIndex(r => r.id === reminderId);
    if (index === -1) {
      throw new Error('提醒不存在');
    }

    const updatedReminder = {
      ...this.reminders[index],
      ...updates,
      updatedAt: new Date(),
    };

    this.reminders[index] = updatedReminder;
    await this.saveReminders();

    // 如果提醒已启用，重新调度
    if (updatedReminder.enabled) {
      await this.cancelReminder(reminderId);
      await this.scheduleReminder(updatedReminder);
    } else {
      await this.cancelReminder(reminderId);
    }

    return updatedReminder;
  }

  // 删除提醒
  async deleteReminder(reminderId: string): Promise<void> {
    await this.cancelReminder(reminderId);
    this.reminders = this.reminders.filter(r => r.id !== reminderId);
    await this.saveReminders();
  }

  // 获取提醒
  async getReminder(reminderId: string): Promise<ReminderConfig | undefined> {
    return this.reminders.find(r => r.id === reminderId);
  }

  // 获取Todo的所有提醒
  async getTodoReminders(todoId: string): Promise<ReminderConfig[]> {
    return this.reminders.filter(r => r.todoId === todoId);
  }

  // 调度提醒
  private async scheduleReminder(reminder: ReminderConfig): Promise<void> {
    try {
      const todo = await this.getTodo(reminder.todoId);
      if (!todo) {
        throw new Error('待办事项不存在');
      }

      if (reminder.type === 'once') {
        await this.scheduleOnceReminder(reminder, todo);
      } else {
        await this.scheduleRepeatReminder(reminder, todo);
      }
    } catch (error) {
      console.error('调度提醒失败:', error);
      throw error;
    }
  }

  // 调度单次提醒
  private async scheduleOnceReminder(reminder: ReminderConfig, todo: Todo): Promise<void> {
    if (reminder.time <= new Date()) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '待办提醒',
        body: `"${todo.title}" 将在 ${format(todo.dueDate || reminder.time, 'HH:mm')} 截止`,
        data: { todoId: todo.id, reminderId: reminder.id },
      },
      trigger: {
        date: reminder.time,
      },
    });
  }

  // 调度重复提醒
  private async scheduleRepeatReminder(reminder: ReminderConfig, todo: Todo): Promise<void> {
    if (!reminder.repeatInterval && !reminder.repeatDays) {
      throw new Error('重复提醒必须设置重复间隔或重复日期');
    }

    if (reminder.repeatInterval) {
      // 按间隔重复
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '待办提醒',
          body: `"${todo.title}" 需要处理`,
          data: { todoId: todo.id, reminderId: reminder.id },
        },
        trigger: {
          seconds: reminder.repeatInterval * 60,
          repeats: true,
        },
      });
    } else if (reminder.repeatDays) {
      // 按星期几重复
      for (const weekDay of reminder.repeatDays) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '待办提醒',
            body: `"${todo.title}" 需要处理`,
            data: { todoId: todo.id, reminderId: reminder.id },
          },
          trigger: {
            weekday: weekDay + 1, // expo-notifications使用1-7表示周一到周日
            hour: reminder.time.getHours(),
            minute: reminder.time.getMinutes(),
            repeats: true,
          },
        });
      }
    }
  }

  // 取消提醒
  async cancelReminder(reminderId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(reminderId);
    } catch (error) {
      console.error('取消提醒失败:', error);
    }
  }

  // 取消所有提醒
  async cancelAllReminders(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('取消所有提醒失败:', error);
    }
  }

  // 获取Todo信息（需要实现）
  private async getTodo(todoId: string): Promise<Todo | undefined> {
    // 这里需要实现从TodoService获取Todo信息的逻辑
    return undefined;
  }
} 