import AsyncStorage from '@react-native-async-storage/async-storage';

const GESTURE_CONFIG_KEY = '@gesture_config';

export interface GestureConfig {
  enabled: boolean;
  swipeToComplete: boolean;
  swipeToDelete: boolean;
  swipeToEdit: boolean;
  longPressToSelect: boolean;
  doubleTapToExpand: boolean;
  swipeThreshold: number;
}

export const defaultGestureConfig: GestureConfig = {
  enabled: true,
  swipeToComplete: true,
  swipeToDelete: true,
  swipeToEdit: true,
  longPressToSelect: true,
  doubleTapToExpand: true,
  swipeThreshold: 50,
};

export class GestureService {
  private static instance: GestureService;
  private config: GestureConfig = defaultGestureConfig;

  private constructor() {}

  static getInstance(): GestureService {
    if (!GestureService.instance) {
      GestureService.instance = new GestureService();
    }
    return GestureService.instance;
  }

  async initialize(): Promise<void> {
    try {
      const savedConfig = await AsyncStorage.getItem(GESTURE_CONFIG_KEY);
      if (savedConfig) {
        this.config = { ...defaultGestureConfig, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.error('初始化手势配置失败:', error);
    }
  }

  async saveConfig(config: Partial<GestureConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...config };
      await AsyncStorage.setItem(GESTURE_CONFIG_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('保存手势配置失败:', error);
      throw error;
    }
  }

  getConfig(): GestureConfig {
    return { ...this.config };
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  isSwipeToCompleteEnabled(): boolean {
    return this.config.enabled && this.config.swipeToComplete;
  }

  isSwipeToDeleteEnabled(): boolean {
    return this.config.enabled && this.config.swipeToDelete;
  }

  isSwipeToEditEnabled(): boolean {
    return this.config.enabled && this.config.swipeToEdit;
  }

  isLongPressToSelectEnabled(): boolean {
    return this.config.enabled && this.config.longPressToSelect;
  }

  isDoubleTapToExpandEnabled(): boolean {
    return this.config.enabled && this.config.doubleTapToExpand;
  }

  getSwipeThreshold(): number {
    return this.config.swipeThreshold;
  }
} 