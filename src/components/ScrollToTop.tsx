import React, { memo, useState, useCallback } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AnimationUtils } from '../utils/animations';

interface ScrollToTopProps {
  scrollRef: React.RefObject<any>;
  scrollThreshold?: number;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({
  scrollRef,
  scrollThreshold = 300,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const opacity = new Animated.Value(0);

  // 处理滚动事件
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShow = offsetY > scrollThreshold;

    if (shouldShow !== isVisible) {
      setIsVisible(shouldShow);
      if (shouldShow) {
        AnimationUtils.fadeIn(opacity);
      } else {
        AnimationUtils.fadeOut(opacity);
      }
    }
  }, [isVisible, opacity, scrollThreshold]);

  // 处理点击事件
  const handlePress = useCallback(() => {
    scrollRef.current?.scrollToOffset({
      offset: 0,
      animated: true,
    });
  }, [scrollRef]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [
            {
              scale: opacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <MaterialIcons name="keyboard-arrow-up" size={24} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    zIndex: 1000,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default memo(ScrollToTop); 