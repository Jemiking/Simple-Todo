import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomTheme, Theme, ThemeColors } from '../types/theme';

const CUSTOM_THEMES_KEY = '@custom_themes';

export class ThemeService {
  private static instance: ThemeService;
  private customThemes: CustomTheme[] = [];

  private constructor() {}

  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.loadCustomThemes();
    } catch (error) {
      console.error('初始化主题服务失败:', error);
      throw error;
    }
  }

  private async loadCustomThemes(): Promise<void> {
    try {
      const themesJson = await AsyncStorage.getItem(CUSTOM_THEMES_KEY);
      if (themesJson) {
        const parsedThemes = JSON.parse(themesJson);
        this.customThemes = parsedThemes.map((theme: any) => ({
          ...theme,
          createdAt: new Date(theme.createdAt),
          updatedAt: new Date(theme.updatedAt),
        }));
      }
    } catch (error) {
      console.error('加载自定义主题失败:', error);
      throw error;
    }
  }

  private async saveCustomThemes(): Promise<void> {
    try {
      const themesJson = JSON.stringify(this.customThemes);
      await AsyncStorage.setItem(CUSTOM_THEMES_KEY, themesJson);
    } catch (error) {
      console.error('保存自定义主题失败:', error);
      throw error;
    }
  }

  async createTheme(theme: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomTheme> {
    const newTheme: CustomTheme = {
      ...theme,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.customThemes.push(newTheme);
    await this.saveCustomThemes();
    return newTheme;
  }

  async updateTheme(themeId: string, updates: Partial<Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CustomTheme> {
    const index = this.customThemes.findIndex(t => t.id === themeId);
    if (index === -1) {
      throw new Error('主题不存在');
    }

    const updatedTheme = {
      ...this.customThemes[index],
      ...updates,
      updatedAt: new Date(),
    };

    this.customThemes[index] = updatedTheme;
    await this.saveCustomThemes();
    return updatedTheme;
  }

  async deleteTheme(themeId: string): Promise<void> {
    this.customThemes = this.customThemes.filter(t => t.id !== themeId);
    await this.saveCustomThemes();
  }

  async getTheme(themeId: string): Promise<CustomTheme | undefined> {
    return this.customThemes.find(t => t.id === themeId);
  }

  async getCustomThemes(): Promise<CustomTheme[]> {
    return [...this.customThemes];
  }

  validateThemeColors(colors: Partial<ThemeColors>): string[] {
    const errors: string[] = [];
    const requiredColors: (keyof ThemeColors)[] = [
      'primary',
      'background',
      'card',
      'text',
      'border',
      'notification',
      'error',
      'success',
      'warning',
      'info',
    ];

    // 检查必需的颜色
    for (const color of requiredColors) {
      if (!colors[color]) {
        errors.push(`缺少必需的颜色: ${color}`);
      }
    }

    // 验证颜色格式
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    Object.entries(colors).forEach(([key, value]) => {
      if (value && !colorRegex.test(value)) {
        errors.push(`颜色格式无效: ${key} (${value})`);
      }
    });

    return errors;
  }

  generateThemeFromBase(baseTheme: Theme, colorOverrides: Partial<ThemeColors>): ThemeColors {
    return {
      ...baseTheme.colors,
      ...colorOverrides,
    };
  }

  adjustColorBrightness(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const adjustValue = (value: number): number => {
      return Math.min(255, Math.max(0, value + amount));
    };

    const rr = adjustValue(r).toString(16).padStart(2, '0');
    const gg = adjustValue(g).toString(16).padStart(2, '0');
    const bb = adjustValue(b).toString(16).padStart(2, '0');

    return `#${rr}${gg}${bb}`;
  }

  generatePalette(baseColor: string): ThemeColors {
    // 从基础颜色生成调色板
    const darken = (color: string, amount: number) => this.adjustColorBrightness(color, -amount);
    const lighten = (color: string, amount: number) => this.adjustColorBrightness(color, amount);

    return {
      primary: baseColor,
      background: '#FFFFFF',
      card: lighten(baseColor, 220),
      text: '#000000',
      border: darken(baseColor, 20),
      notification: baseColor,
      error: '#F44336',
      success: '#4CAF50',
      warning: '#FFC107',
      info: lighten(baseColor, 20),
    };
  }
} 