import React, { createContext, useContext, useEffect, useState } from 'react';
import { I18nService, Language, I18nConfig, defaultI18nConfig, supportedLanguages } from '../services/i18nService';

interface I18nContextType {
  language: Language;
  supportedLanguages: typeof supportedLanguages;
  t: (key: string, params?: { [key: string]: string | number }) => string;
  setLanguage: (language: Language) => Promise<void>;
  isLanguageSupported: (language: Language) => boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<I18nConfig>(defaultI18nConfig);
  const i18nService = I18nService.getInstance();

  useEffect(() => {
    const initializeI18n = async () => {
      try {
        await i18nService.initialize();
        setConfig(i18nService.getConfig());
      } catch (error) {
        console.error('初始化语言服务失败:', error);
      }
    };

    initializeI18n();
  }, []);

  const setLanguage = async (language: Language) => {
    try {
      await i18nService.setLanguage(language);
      setConfig(i18nService.getConfig());
    } catch (error) {
      console.error('设置语言失败:', error);
      throw error;
    }
  };

  const value: I18nContextType = {
    language: config.language,
    supportedLanguages,
    t: i18nService.t,
    setLanguage,
    isLanguageSupported: i18nService.isLanguageSupported.bind(i18nService),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}; 