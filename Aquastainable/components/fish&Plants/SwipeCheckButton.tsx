import React, { useRef, useState } from 'react';
import { Animated, Easing, PanResponder, StyleSheet, Text, View } from 'react-native';

type Props = {
  onSwipe: () => void;
};

export default function SwipeCheckButton({ onSwipe }: Props) {
  const pan = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  const maxTranslate = Math.max(0, containerWidth - 60 - 16);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (_, gestureState) => {
        const nextValue = Math.max(0, Math.min(gestureState.dx, maxTranslate));
        pan.setValue(nextValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= maxTranslate * 0.75) {
          Animated.timing(pan, {
            toValue: maxTranslate,
            duration: 140,
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

  const textOpacity = pan.interpolate({
    inputRange: [0, Math.max(1, maxTranslate * 0.5)],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.track} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <Animated.Text style={[styles.text, { opacity: textOpacity }]}>Swipe to check compatibility</Animated.Text>
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.thumb, { transform: [{ translateX: pan }] }]}
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
