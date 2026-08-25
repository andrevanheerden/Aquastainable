import React, { useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';
import { IconSymbol } from '../ui/icon-symbol';

const SWIPE_THUMB_SIZE = 52;
const SWIPE_PADDING = 4;

type Props = {
  onSwipe: () => void;
  label?: string;
  disabled?: boolean;
};

export default function SwipeCheckButton({ onSwipe, label = 'Swipe to check compatibility', disabled = false }: Props) {
  const pan = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const containerWidthRef = useRef(0);
  const disabledRef = useRef(disabled);
  const onSwipeRef = useRef(onSwipe);
  disabledRef.current = disabled;
  onSwipeRef.current = onSwipe;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponder: (_, gestureState) => !disabledRef.current && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (_, gestureState) => {
        const activeMaxTranslate = Math.max(0, containerWidthRef.current - SWIPE_THUMB_SIZE - SWIPE_PADDING * 2);
        const newValue = Math.max(0, Math.min(gestureState.dx, activeMaxTranslate));
        pan.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        const activeMaxTranslate = Math.max(0, containerWidthRef.current - SWIPE_THUMB_SIZE - SWIPE_PADDING * 2);
        if (gestureState.dx >= activeMaxTranslate * 0.75) {
          Animated.timing(pan, { toValue: activeMaxTranslate, duration: 120, useNativeDriver: true }).start(() => {
            onSwipeRef.current();
            setTimeout(() => {
              Animated.spring(pan, { toValue: 0, friction: 6, useNativeDriver: true }).start();
            }, 600);
          });
        } else {
          Animated.spring(pan, { toValue: 0, friction: 5, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const maxTranslate = Math.max(0, containerWidth - SWIPE_THUMB_SIZE - SWIPE_PADDING * 2);
  const textOpacity = pan.interpolate({
    inputRange: [0, Math.max(1, maxTranslate * 0.5)],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={styles.swipeTrack}
      {...panResponder.panHandlers}
      onLayout={(e) => {
        containerWidthRef.current = e.nativeEvent.layout.width;
        setContainerWidth(e.nativeEvent.layout.width);
      }}
    >
      <Animated.Text style={[styles.swipeText, { opacity: textOpacity, color: disabled ? '#6E7684' : '#FFFFFF' }]}>{label}</Animated.Text>
      <Animated.View
        style={[styles.swipeThumb, { transform: [{ translateX: pan }], backgroundColor: disabled ? '#3A4258' : '#3B82F6' }]}
      >
        <IconSymbol name="chevron.right" size={22} color="#FFFFFF" style={styles.swipeIcon} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeTrack: {
    height: 60,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 30,
    justifyContent: 'center',
    padding: SWIPE_PADDING,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
  },
  swipeText: {
    position: 'absolute',
    alignSelf: 'center',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  swipeThumb: {
    width: SWIPE_THUMB_SIZE,
    height: SWIPE_THUMB_SIZE,
    borderRadius: SWIPE_THUMB_SIZE / 2,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  swipeIcon: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});
