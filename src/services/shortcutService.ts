import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SHORTCUT_CONFIG_KEY = '@shortcut_config';

export interface ShortcutConfig {
  enabled: boolean;
  shortcuts: {
    // 导航
    toggleTabs: string[];
    goBack: string[];
    // 列表操作
    moveUp: string[];
    moveDown: string[];
    toggleComplete: string[];
    delete: string[];
    // 搜索
    search: string[];
    // 新建和编辑
    newTodo: string[];
    save: string[];
  };
}

export const defaultShortcutConfig: ShortcutConfig = {
  enabled: true,
  shortcuts: {
    // 导航
    toggleTabs: Platform.select({
      web: ['Alt', 'Tab'],
      default: [],
    }),
    goBack: Platform.select({
      web: ['Escape'],
      default: [],
    }),
    // 列表操作
    moveUp: Platform.select({
      web: ['ArrowUp'],
      default: [],
    }),
    moveDown: Platform.select({
      web: ['ArrowDown'],
      default: [],
    }),
    toggleComplete: Platform.select({
      web: [' '], // 空格键
      default: [],
    }),
    delete: Platform.select({
      web: ['Delete'],
      default: [],
    }),
    // 搜索
    search: Platform.select({
      web: ['Control', 'f'],
      default: [],
    }),
    // 新建和编辑
    newTodo: Platform.select({
      web: ['Control', 'n'],
      default: [],
    }),
    save: Platform.select({
      web: ['Control', 's'],
      default: [],
    }),
  },
};

export class ShortcutService {
  private static instance: ShortcutService;
  private config: ShortcutConfig = defaultShortcutConfig;
  private pressedKeys: Set<string> = new Set();
  private handlers: Map<string, () => void> = new Map();

  private constructor() {}

  static getInstance(): ShortcutService {
    if (!ShortcutService.instance) {
      ShortcutService.instance = new ShortcutService();
    }
    return ShortcutService.instance;
  }

  async initialize(): Promise<void> {
    try {
      const savedConfig = await AsyncStorage.getItem(SHORTCUT_CONFIG_KEY);
      if (savedConfig) {
        this.config = { ...defaultShortcutConfig, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.error('初始化快捷键配置失败:', error);
    }
  }

  async saveConfig(config: Partial<ShortcutConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...config };
      await AsyncStorage.setItem(SHORTCUT_CONFIG_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('保存快捷键配置失败:', error);
      throw error;
    }
  }

  getConfig(): ShortcutConfig {
    return { ...this.config };
  }

  isEnabled(): boolean {
    return this.config.enabled && Platform.OS === 'web';
  }

  registerHandler(action: keyof ShortcutConfig['shortcuts'], handler: () => void): void {
    this.handlers.set(action, handler);
  }

  unregisterHandler(action: keyof ShortcutConfig['shortcuts']): void {
    this.handlers.delete(action);
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled()) return;

    this.pressedKeys.add(event.key);
    this.checkShortcuts();
  }

  handleKeyUp(event: KeyboardEvent): void {
    this.pressedKeys.delete(event.key);
  }

  private checkShortcuts(): void {
    if (!this.isEnabled()) return;

    const pressedKeys = Array.from(this.pressedKeys);
    
    Object.entries(this.config.shortcuts).forEach(([action, keys]) => {
      if (
        keys.length === pressedKeys.length &&
        keys.every(key => pressedKeys.includes(key))
      ) {
        const handler = this.handlers.get(action as keyof ShortcutConfig['shortcuts']);
        if (handler) {
          handler();
          // 阻止默认行为
          event?.preventDefault();
        }
      }
    });
  }

  clearPressedKeys(): void {
    this.pressedKeys.clear();
  }
} 