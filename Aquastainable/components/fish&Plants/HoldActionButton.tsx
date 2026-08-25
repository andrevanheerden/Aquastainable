import React, { useRef } from 'react';
import { Animated, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

type Props = {
  label: string;
  onHold: () => void;
  fillColor: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export default function HoldActionButton({ label, onHold, fillColor, style, textStyle }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progress = useRef(new Animated.Value(0)).current;

  const startHold = () => {
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 500, useNativeDriver: false }).start();
    timer.current = setTimeout(() => {
      timer.current = null;
      onHold();
    }, 500);
  };

  const cancelHold = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    Animated.timing(progress, { toValue: 0, duration: 100, useNativeDriver: false }).start();
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPressIn={startHold}
      onPressOut={cancelHold}
      onPress={cancelHold}
      activeOpacity={0.85}
      accessibilityLabel={label}
    >
      <Animated.View pointerEvents="none" style={[styles.fill, { backgroundColor: fillColor, transform: [{ scaleX: progress }] }]} />
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 36,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#20232C',
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    transformOrigin: 'left',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
