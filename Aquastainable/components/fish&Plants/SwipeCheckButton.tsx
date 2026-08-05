import React, { useRef, useState } from 'react';
import { Animated, Easing, PanResponder, StyleSheet, Text, View } from 'react-native';

type Props = {
  onSwipe: () => void;
  label?: string;
  disabled?: boolean;
};

export default function SwipeCheckButton({ onSwipe, label = 'Swipe to check compatibility', disabled = false }: Props) {
  const pan = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const containerWidthRef = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_, gestureState) => !disabled && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (_, gestureState) => {
        const activeMaxTranslate = Math.max(0, containerWidthRef.current - 60 - 16);
        const nextValue = Math.max(0, Math.min(gestureState.dx, activeMaxTranslate));
        pan.setValue(nextValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        const activeMaxTranslate = Math.max(0, containerWidthRef.current - 60 - 16);
        if (gestureState.dx >= activeMaxTranslate * 0.75) {
          Animated.timing(pan, {
            toValue: activeMaxTranslate,
            duration: 120,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start(() => {
            onSwipe();
            Animated.spring(pan, {
              toValue: 0,
              friction: 6,
              useNativeDriver: true,
            }).start();
          });
        } else {
          Animated.spring(pan, {
            toValue: 0,
            friction: 6,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const maxTranslate = Math.max(0, containerWidthRef.current - 60 - 16);
  const textOpacity = pan.interpolate({
    inputRange: [0, Math.max(1, maxTranslate * 0.5)],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={styles.track}
      onLayout={(e) => {
        containerWidthRef.current = e.nativeEvent.layout.width;
        setContainerWidth(e.nativeEvent.layout.width);
      }}
    >
      <Animated.Text style={[styles.text, { opacity: textOpacity, color: disabled ? '#6E7684' : '#B3B9C9' }]}>{label}</Animated.Text>
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.thumb, { transform: [{ translateX: pan }], backgroundColor: disabled ? '#3A4258' : '#5B8CFF' }]}
      >
        <Text style={styles.arrow}>›</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 56,
    borderRadius: 30,
    backgroundColor: '#1B1D26',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  text: {
    position: 'absolute',
    alignSelf: 'center',
    color: '#B3B9C9',
    fontSize: 14,
    fontWeight: '600',
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5B8CFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 28,
  },
});
