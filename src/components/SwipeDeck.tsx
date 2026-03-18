import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, ViewStyle, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Article } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_HEIGHT * 0.13;
const VELOCITY_THRESHOLD = 700;

const SNAP_BACK = { damping: 14, stiffness: 160, mass: 0.85 };
const EXIT     = { damping: 26, stiffness: 200 };

interface SwipeDeckProps {
  articles: Article[];
  currentIndex: number;
  onSwipe: () => void;
  onSwipeBack?: () => void;
  onRefresh?: () => void;
  renderCard: (article: Article) => React.ReactNode;
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({
  articles,
  currentIndex,
  onSwipe,
  onSwipeBack,
  onRefresh,
  renderCard,
}) => {
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const ready = containerSize.h > 0;

  const translateY   = useSharedValue(0);
  const translateX   = useSharedValue(0);
  const isAnimating  = useSharedValue(false);

  // Worklet-safe booleans — updated via useEffect, read inside gestures
  const canGoBackSV    = useSharedValue(false);
  const canGoForwardSV = useSharedValue(true);

  useEffect(() => {
    canGoBackSV.value    = currentIndex > 0;
    canGoForwardSV.value = currentIndex < articles.length - 1;
  }, [currentIndex, articles.length]);

  // Reset transform when currentIndex changes (index is already updated by JS before this runs)
  useEffect(() => {
    translateY.value  = 0;
    translateX.value  = 0;
    isAnimating.value = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const pan = Gesture.Pan()
    .activeOffsetY([-6, 6])
    .failOffsetX([-18, 18])
    .onUpdate((e) => {
      'worklet';
      if (isAnimating.value) return;
      translateY.value = e.translationY;
      translateX.value = e.translationX * 0.06;
    })
    .onEnd((e) => {
      'worklet';
      if (isAnimating.value) return;

      const swipedUp   = e.translationY < -SWIPE_THRESHOLD || e.velocityY < -VELOCITY_THRESHOLD;
      const swipedDown = e.translationY >  SWIPE_THRESHOLD || e.velocityY >  VELOCITY_THRESHOLD;

      if (swipedUp && canGoForwardSV.value) {
        // ── Advance to next article ──
        isAnimating.value = true;
        translateX.value  = withSpring(0, EXIT);
        translateY.value  = withSpring(
          -SCREEN_HEIGHT * 1.1,
          { ...EXIT, velocity: e.velocityY },
          (finished) => {
            'worklet';
            if (finished) {
              translateY.value  = 0;
              translateX.value  = 0;
              isAnimating.value = false;
              runOnJS(onSwipe)();
            }
          },
        );
      } else if (swipedDown && canGoBackSV.value) {
        // ── Go back to previous article ──
        isAnimating.value = true;
        translateX.value  = withSpring(0, EXIT);
        translateY.value  = withSpring(
          SCREEN_HEIGHT * 1.1,
          { ...EXIT, velocity: e.velocityY },
          (finished) => {
            'worklet';
            if (finished) {
              translateY.value  = 0;
              translateX.value  = 0;
              isAnimating.value = false;
              if (onSwipeBack) runOnJS(onSwipeBack)();
            }
          },
        );
      } else if (swipedDown && !canGoBackSV.value && onRefresh) {
        // ── Pull-to-refresh at first article ──
        translateY.value = withSpring(0, SNAP_BACK);
        translateX.value = withSpring(0, SNAP_BACK);
        runOnJS(onRefresh)();
      } else {
        // ── Snap back ──
        translateY.value = withSpring(0, SNAP_BACK);
        translateX.value = withSpring(0, SNAP_BACK);
      }
    });

  // Current card: follows finger
  const topCardStyle = useAnimatedStyle(() => {
    'worklet';
    const rotate = interpolate(
      translateX.value,
      [-60, 0, 60],
      [-0.8, 0, 0.8],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { rotateZ: `${rotate}deg` },
      ],
    };
  });

  // Next card: only animates in while swiping UP (translateY < 0)
  const nextCardStyle = useAnimatedStyle(() => {
    'worklet';
    if (translateY.value >= 0) {
      return { opacity: 0, transform: [{ scale: 0.92 }, { translateY: 32 }] };
    }
    const p = Math.min(-translateY.value / SWIPE_THRESHOLD, 1);
    return {
      opacity: interpolate(p, [0, 0.2, 1], [0, 0.85, 1], Extrapolation.CLAMP),
      transform: [
        { scale: interpolate(p, [0, 1], [0.92, 1], Extrapolation.CLAMP) },
        { translateY: interpolate(p, [0, 1], [32, 0], Extrapolation.CLAMP) },
      ],
    };
  });

  const currentArticle = articles[currentIndex];
  const nextArticle    = articles[currentIndex + 1];
  const prevArticle    = articles[currentIndex - 1];

  if (!currentArticle) return null;

  const cardWrapperStyle: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: containerSize.w,
    height: containerSize.h,
  };

  const hw = Platform.OS === 'android' ? { renderToHardwareTextureAndroid: true } : {};

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const { width: w, height: h } = e.nativeEvent.layout;
        if (w > 0 && h > 0 && (w !== containerSize.w || h !== containerSize.h)) {
          setContainerSize({ w, h });
        }
      }}
    >
      {/* Z-order: prevCard (bottom) → nextCard → topCard (top) */}

      {/* Previous article — full bleed, no animation; revealed as top card slides DOWN */}
      {ready && prevArticle && (
        <View style={cardWrapperStyle} {...hw}>
          {renderCard(prevArticle)}
        </View>
      )}

      {/* Next article — scales/fades in only while swiping UP */}
      {ready && nextArticle && (
        <Animated.View style={[cardWrapperStyle, nextCardStyle, styles.backCardClip]} {...hw}>
          {renderCard(nextArticle)}
        </Animated.View>
      )}

      {/* Current article — gesture-driven */}
      {ready && (
        <GestureDetector gesture={pan}>
          <Animated.View style={[cardWrapperStyle, topCardStyle]} {...hw}>
            {renderCard(currentArticle)}
          </Animated.View>
        </GestureDetector>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  backCardClip: {
    borderRadius: 20,
    overflow: 'hidden',
  },
});
