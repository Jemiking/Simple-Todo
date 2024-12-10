import { Animated, Easing } from 'react-native';

export class AnimationUtils {
  // 淡入动画
  static fadeIn(value: Animated.Value, duration: number = 300): Promise<void> {
    return new Promise(resolve => {
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  }

  // 淡出动画
  static fadeOut(value: Animated.Value, duration: number = 300): Promise<void> {
    return new Promise(resolve => {
      Animated.timing(value, {
        toValue: 0,
        duration,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  }

  // 缩放动画
  static scale(value: Animated.Value, toValue: number, duration: number = 300): Promise<void> {
    return new Promise(resolve => {
      Animated.timing(value, {
        toValue,
        duration,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  }

  // 弹性动画
  static spring(value: Animated.Value, toValue: number): Promise<void> {
    return new Promise(resolve => {
      Animated.spring(value, {
        toValue,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  }

  // 平移动画
  static translate(
    value: Animated.Value,
    toValue: number,
    duration: number = 300,
  ): Promise<void> {
    return new Promise(resolve => {
      Animated.timing(value, {
        toValue,
        duration,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  }

  // 旋转动画
  static rotate(value: Animated.Value, duration: number = 300): Promise<void> {
    return new Promise(resolve => {
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  }

  // 序列动画
  static sequence(animations: Animated.CompositeAnimation[]): Promise<void> {
    return new Promise(resolve => {
      Animated.sequence(animations).start(() => resolve());
    });
  }

  // 并行动画
  static parallel(animations: Animated.CompositeAnimation[]): Promise<void> {
    return new Promise(resolve => {
      Animated.parallel(animations).start(() => resolve());
    });
  }

  // 交错动画
  static stagger(
    duration: number,
    animations: Animated.CompositeAnimation[],
  ): Promise<void> {
    return new Promise(resolve => {
      Animated.stagger(duration, animations).start(() => resolve());
    });
  }

  // 循环动画
  static loop(animation: Animated.CompositeAnimation): Animated.CompositeAnimation {
    return Animated.loop(animation);
  }

  // 创建动画值
  static createValue(initialValue: number = 0): Animated.Value {
    return new Animated.Value(initialValue);
  }

  // 创建插值
  static interpolate(
    value: Animated.Value,
    inputRange: number[],
    outputRange: number[] | string[],
  ): Animated.AnimatedInterpolation {
    return value.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  }
} 