import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
import * as Localization from 'expo-localization';

const LANGUAGE_KEY = '@language';

export type Language = 'zh' | 'en' | 'ja' | 'ko' | 'system';

export interface I18nConfig {
  language: Language;
  fallbackLanguage: Language;
}

export const defaultI18nConfig: I18nConfig = {
  language: 'system',
  fallbackLanguage: 'en',
};

export const supportedLanguages = [
  { code: 'zh', name: '简体中文', icon: '🇨🇳' },
  { code: 'en', name: 'English', icon: '🇺🇸' },
  { code: 'ja', name: '日本語', icon: '🇯🇵' },
  { code: 'ko', name: '한국어', icon: '🇰🇷' },
];

export class I18nService {
  private static instance: I18nService;
  private config: I18nConfig = defaultI18nConfig;
  private translations: { [key: string]: { [key: string]: string } } = {};
  private currentLanguage: Language = 'system';

  private constructor() {}

  static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // 加载保存的语言配置
      const savedConfig = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedConfig) {
        this.config = { ...defaultI18nConfig, ...JSON.parse(savedConfig) };
      }

      // 加载翻译资源
      await this.loadTranslations();

      // 设置当前语言
      await this.setLanguage(this.config.language);
    } catch (error) {
      console.error('初始化语言服务失败:', error);
    }
  }

  private async loadTranslations(): Promise<void> {
    // 加载所有语言的翻译文件
    this.translations = {
      zh: require('../locales/zh.json'),
      en: require('../locales/en.json'),
      ja: require('../locales/ja.json'),
      ko: require('../locales/ko.json'),
    };
  }

  async saveConfig(config: Partial<I18nConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...config };
      await AsyncStorage.setItem(LANGUAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('保存语言配置失败:', error);
      throw error;
    }
  }

  getConfig(): I18nConfig {
    return { ...this.config };
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  getSystemLanguage(): Language {
    // 获取系统语言
    const locale =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale ||
          NativeModules.SettingsManager.settings.AppleLanguages[0]
        : NativeModules.I18nManager.localeIdentifier;

    // 从locale中提取语言代码
    const languageCode = locale.split('_')[0];

    // 检查是否支持该语言
    if (this.isLanguageSupported(languageCode as Language)) {
      return languageCode as Language;
    }

    return this.config.fallbackLanguage;
  }

  async setLanguage(language: Language): Promise<void> {
    try {
      const newLanguage = language === 'system' ? this.getSystemLanguage() : language;
      
      if (!this.isLanguageSupported(newLanguage)) {
        throw new Error(`不支持的语言: ${newLanguage}`);
      }

      this.currentLanguage = language;
      await this.saveConfig({ language });
    } catch (error) {
      console.error('设置语言失败:', error);
      throw error;
    }
  }

  isLanguageSupported(language: Language): boolean {
    return language === 'system' || supportedLanguages.some(lang => lang.code === language);
  }

  translate(key: string, params?: { [key: string]: string | number }): string {
    try {
      const language = this.currentLanguage === 'system'
        ? this.getSystemLanguage()
        : this.currentLanguage;

      let translation = this.translations[language]?.[key];
      
      if (!translation) {
        // 如果当前语言没有该翻译，使用后备语言
        translation = this.translations[this.config.fallbackLanguage]?.[key];
      }

      if (!translation) {
        console.warn(`未找到翻译: ${key}`);
        return key;
      }

      // 替换参数
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          translation = translation.replace(`{${param}}`, String(value));
        });
      }

      return translation;
    } catch (error) {
      console.error('翻译失败:', error);
      return key;
    }
  }

  t = this.translate.bind(this);
} 