import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ColorMode, LightTheme, DarkTheme, CustomTheme } from '../types/theme';
import { ThemeService } from '../services/themeService';

interface ThemeContextType {
  theme: Theme;
  colorMode: ColorMode;
  customThemes: CustomTheme[];
  selectedCustomThemeId?: string;
  setColorMode: (mode: ColorMode) => Promise<void>;
  setSelectedCustomThemeId: (themeId: string) => Promise<void>;
  createCustomTheme: (theme: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CustomTheme>;
  updateCustomTheme: (themeId: string, updates: Partial<Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<CustomTheme>;
  deleteCustomTheme: (themeId: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_MODE_KEY = '@theme_mode';
const CUSTOM_THEME_ID_KEY = '@custom_theme_id';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [colorMode, setColorMode] = useState<ColorMode>('system');
  const [theme, setTheme] = useState<Theme>(systemColorScheme === 'dark' ? DarkTheme : LightTheme);
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [selectedCustomThemeId, setSelectedCustomThemeId] = useState<string>();
  const themeService = ThemeService.getInstance();

  // 初始化
  useEffect(() => {
    const initialize = async () => {
      try {
        await themeService.initialize();
        await loadSavedThemeMode();
        await loadCustomThemes();
        await loadSelectedCustomThemeId();
      } catch (error) {
        console.error('初始化主题失败:', error);
      }
    };
    initialize();
  }, []);

  // 加载保存的主题模式
  const loadSavedThemeMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_MODE_KEY);
      if (savedMode) {
        setColorMode(savedMode as ColorMode);
      }
    } catch (error) {
      console.error('加载主题模式失败:', error);
    }
  };

  // 加载自定义主题
  const loadCustomThemes = async () => {
    try {
      const themes = await themeService.getCustomThemes();
      setCustomThemes(themes);
    } catch (error) {
      console.error('加载自定义主题失败:', error);
    }
  };

  // 加载选中的自定义主题ID
  const loadSelectedCustomThemeId = async () => {
    try {
      const themeId = await AsyncStorage.getItem(CUSTOM_THEME_ID_KEY);
      if (themeId) {
        setSelectedCustomThemeId(themeId);
      }
    } catch (error) {
      console.error('加载选中的自定义主题失败:', error);
    }
  };

  // 根据colorMode和系统主题更新当前主题
  useEffect(() => {
    const determineTheme = async () => {
      switch (colorMode) {
        case 'light':
          setTheme(LightTheme);
          break;
        case 'dark':
          setTheme(DarkTheme);
          break;
        case 'system':
          setTheme(systemColorScheme === 'dark' ? DarkTheme : LightTheme);
          break;
        case 'custom':
          if (selectedCustomThemeId) {
            const customTheme = await themeService.getTheme(selectedCustomThemeId);
            if (customTheme) {
              setTheme(customTheme);
            }
          }
          break;
      }
    };

    determineTheme();
  }, [colorMode, systemColorScheme, selectedCustomThemeId]);

  // 更新主题模式
  const handleSetColorMode = async (mode: ColorMode) => {
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, mode);
      setColorMode(mode);
    } catch (error) {
      console.error('保存主题模式失败:', error);
    }
  };

  // 更新选中的自定义主题
  const handleSetSelectedCustomThemeId = async (themeId: string) => {
    try {
      await AsyncStorage.setItem(CUSTOM_THEME_ID_KEY, themeId);
      setSelectedCustomThemeId(themeId);
      setColorMode('custom');
    } catch (error) {
      console.error('保存选中的自定义主题失败:', error);
    }
  };

  // 创建自定义主题
  const handleCreateCustomTheme = async (theme: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTheme = await themeService.createTheme(theme);
      setCustomThemes(prev => [...prev, newTheme]);
      return newTheme;
    } catch (error) {
      console.error('创建自定义主题失败:', error);
      throw error;
    }
  };

  // 更新自定义主题
  const handleUpdateCustomTheme = async (
    themeId: string,
    updates: Partial<Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    try {
      const updatedTheme = await themeService.updateTheme(themeId, updates);
      setCustomThemes(prev =>
        prev.map(theme => (theme.id === themeId ? updatedTheme : theme))
      );
      if (selectedCustomThemeId === themeId) {
        setTheme(updatedTheme);
      }
      return updatedTheme;
    } catch (error) {
      console.error('更新自定义主题失败:', error);
      throw error;
    }
  };

  // 删除自定义主题
  const handleDeleteCustomTheme = async (themeId: string) => {
    try {
      await themeService.deleteTheme(themeId);
      setCustomThemes(prev => prev.filter(theme => theme.id !== themeId));
      if (selectedCustomThemeId === themeId) {
        setSelectedCustomThemeId(undefined);
        setColorMode('system');
      }
    } catch (error) {
      console.error('删除自定义主题失败:', error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorMode,
        customThemes,
        selectedCustomThemeId,
        setColorMode: handleSetColorMode,
        setSelectedCustomThemeId: handleSetSelectedCustomThemeId,
        createCustomTheme: handleCreateCustomTheme,
        updateCustomTheme: handleUpdateCustomTheme,
        deleteCustomTheme: handleDeleteCustomTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme必须在ThemeProvider内部使用');
  }
  return context;
}; 