import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { ShortcutService, ShortcutConfig, defaultShortcutConfig } from '../services/shortcutService';

interface ShortcutContextType {
  config: ShortcutConfig;
  isEnabled: boolean;
  updateConfig: (config: Partial<ShortcutConfig>) => Promise<void>;
  registerHandler: (action: keyof ShortcutConfig['shortcuts'], handler: () => void) => void;
  unregisterHandler: (action: keyof ShortcutConfig['shortcuts']) => void;
}

const ShortcutContext = createContext<ShortcutContextType | undefined>(undefined);

export const useShortcut = () => {
  const context = useContext(ShortcutContext);
  if (!context) {
    throw new Error('useShortcut must be used within a ShortcutProvider');
  }
  return context;
};

export const ShortcutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ShortcutConfig>(defaultShortcutConfig);
  const shortcutService = ShortcutService.getInstance();

  useEffect(() => {
    const initializeShortcuts = async () => {
      try {
        await shortcutService.initialize();
        setConfig(shortcutService.getConfig());
      } catch (error) {
        console.error('初始化快捷键配置失败:', error);
      }
    };

    initializeShortcuts();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      shortcutService.handleKeyDown(event);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      shortcutService.handleKeyUp(event);
    };

    const handleBlur = () => {
      shortcutService.clearPressedKeys();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const updateConfig = async (newConfig: Partial<ShortcutConfig>) => {
    try {
      await shortcutService.saveConfig(newConfig);
      setConfig(shortcutService.getConfig());
    } catch (error) {
      console.error('更新快捷键配置失败:', error);
      throw error;
    }
  };

  const value: ShortcutContextType = {
    config,
    isEnabled: shortcutService.isEnabled(),
    updateConfig,
    registerHandler: (action, handler) => shortcutService.registerHandler(action, handler),
    unregisterHandler: (action) => shortcutService.unregisterHandler(action),
  };

  return <ShortcutContext.Provider value={value}>{children}</ShortcutContext.Provider>;
}; 