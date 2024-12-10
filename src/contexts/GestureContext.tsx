import React, { createContext, useContext, useEffect, useState } from 'react';
import { GestureService, GestureConfig, defaultGestureConfig } from '../services/gestureService';

interface GestureContextType {
  config: GestureConfig;
  isEnabled: boolean;
  updateConfig: (config: Partial<GestureConfig>) => Promise<void>;
  isSwipeToCompleteEnabled: () => boolean;
  isSwipeToDeleteEnabled: () => boolean;
  isSwipeToEditEnabled: () => boolean;
  isLongPressToSelectEnabled: () => boolean;
  isDoubleTapToExpandEnabled: () => boolean;
  getSwipeThreshold: () => number;
}

const GestureContext = createContext<GestureContextType | undefined>(undefined);

export const useGesture = () => {
  const context = useContext(GestureContext);
  if (!context) {
    throw new Error('useGesture must be used within a GestureProvider');
  }
  return context;
};

export const GestureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<GestureConfig>(defaultGestureConfig);
  const gestureService = GestureService.getInstance();

  useEffect(() => {
    const initializeGestures = async () => {
      try {
        await gestureService.initialize();
        setConfig(gestureService.getConfig());
      } catch (error) {
        console.error('初始化手势配置失败:', error);
      }
    };

    initializeGestures();
  }, []);

  const updateConfig = async (newConfig: Partial<GestureConfig>) => {
    try {
      await gestureService.saveConfig(newConfig);
      setConfig(gestureService.getConfig());
    } catch (error) {
      console.error('更新手势配置失败:', error);
      throw error;
    }
  };

  const value: GestureContextType = {
    config,
    isEnabled: config.enabled,
    updateConfig,
    isSwipeToCompleteEnabled: () => gestureService.isSwipeToCompleteEnabled(),
    isSwipeToDeleteEnabled: () => gestureService.isSwipeToDeleteEnabled(),
    isSwipeToEditEnabled: () => gestureService.isSwipeToEditEnabled(),
    isLongPressToSelectEnabled: () => gestureService.isLongPressToSelectEnabled(),
    isDoubleTapToExpandEnabled: () => gestureService.isDoubleTapToExpandEnabled(),
    getSwipeThreshold: () => gestureService.getSwipeThreshold(),
  };

  return <GestureContext.Provider value={value}>{children}</GestureContext.Provider>;
}; 