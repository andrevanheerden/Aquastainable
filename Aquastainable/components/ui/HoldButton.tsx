import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

const HOLD_DURATION = 100;

type Props = {
  children: React.ReactNode;
  onHold: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  activeOpacity?: number;
  accessibilityLabel?: string;
};

export default function HoldButton({ children, onHold, style, textStyle, disabled = false, activeOpacity = 0.8, accessibilityLabel }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const triggered = useRef(false);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const startHold = () => {
    if (disabled) return;
    triggered.current = false;
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: HOLD_DURATION, useNativeDriver: false }).start();
    timer.current = setTimeout(() => {
      timer.current = null;
      triggered.current = true;
      onHold();
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (!triggered.current) {
      progress.stopAnimation();
      Animated.timing(progress, { toValue: 0, duration: 80, useNativeDriver: false }).start();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPressIn={startHold}
      onPressOut={cancelHold}
      activeOpacity={activeOpacity}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View pointerEvents="none" style={[styles.fill, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
      <View style={styles.content}>{children}</View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { overflow: 'hidden', position: 'relative' },
  fill: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(46, 140, 166, 0.55)' },
  content: { zIndex: 1 },
});
