import React, { memo, useEffect, useRef } from 'react';
import {
  Animated,
  ViewProps,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import { AnimationUtils } from '../utils/animations';

interface AnimatedViewProps extends ViewProps {
  animation?: 'fade' | 'scale' | 'slide' | 'spring' | 'none';
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  onAnimationComplete?: () => void;
  children?: React.ReactNode;
}

const AnimatedView: React.FC<AnimatedViewProps> = ({
  animation = 'none',
  duration = 300,
  delay = 0,
  style,
  onAnimationComplete,
  children,
  onLayout,
  ...props
}) => {
  const opacity = useRef(new Animated.Value(0));
  const scale = useRef(new Animated.Value(0.8));
  const translateY = useRef(new Animated.Value(50));
  const spring = useRef(new Animated.Value(0.8));

  useEffect(() => {
    if (animation === 'none') {
      opacity.current.setValue(1);
      scale.current.setValue(1);
      translateY.current.setValue(0);
      spring.current.setValue(1);
      return;
    }

    const timeout = setTimeout(() => {
      switch (animation) {
        case 'fade':
          AnimationUtils.fadeIn(opacity.current, duration)
            .then(onAnimationComplete);
          break;
        case 'scale':
          Animated.parallel([
            AnimationUtils.fadeIn(opacity.current, duration),
            AnimationUtils.scale(scale.current, 1, duration),
          ]).start(onAnimationComplete);
          break;
        case 'slide':
          Animated.parallel([
            AnimationUtils.fadeIn(opacity.current, duration),
            AnimationUtils.translate(translateY.current, 0, duration),
          ]).start(onAnimationComplete);
          break;
        case 'spring':
          Animated.parallel([
            AnimationUtils.fadeIn(opacity.current, duration),
            AnimationUtils.spring(spring.current, 1),
          ]).start(onAnimationComplete);
          break;
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [animation, duration, delay, onAnimationComplete]);

  const getAnimatedStyle = (): StyleProp<ViewStyle> => {
    switch (animation) {
      case 'fade':
        return {
          opacity: opacity.current,
        };
      case 'scale':
        return {
          opacity: opacity.current,
          transform: [{ scale: scale.current }],
        };
      case 'slide':
        return {
          opacity: opacity.current,
          transform: [{ translateY: translateY.current }],
        };
      case 'spring':
        return {
          opacity: opacity.current,
          transform: [{ scale: spring.current }],
        };
      default:
        return {};
    }
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    onLayout?.(event);
  };

  return (
    <Animated.View
      {...props}
      style={[style, getAnimatedStyle()]}
      onLayout={handleLayout}
    >
      {children}
    </Animated.View>
  );
};

export default memo(AnimatedView); 