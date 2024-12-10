import { TransitionPresets } from '@react-navigation/stack';
import { Platform } from 'react-native';

// 定义自定义动画配置
export const CustomTransition = {
  // 水平滑动动画
  slideHorizontal: {
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    ...TransitionPresets.SlideFromRightIOS,
  },

  // 垂直滑动动画
  slideVertical: {
    gestureEnabled: true,
    gestureDirection: 'vertical',
    ...TransitionPresets.ModalSlideFromBottomIOS,
  },

  // 渐变动画
  fade: {
    gestureEnabled: false,
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: 300,
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: 300,
        },
      },
    },
    cardStyleInterpolator: ({ current }) => ({
      cardStyle: {
        opacity: current.progress,
      },
    }),
  },

  // 模态弹出动画
  modal: Platform.select({
    ios: TransitionPresets.ModalPresentationIOS,
    android: TransitionPresets.RevealFromBottomAndroid,
  }),
}; 