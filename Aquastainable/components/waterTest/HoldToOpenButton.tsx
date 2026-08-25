import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
  onHold: () => void;
  label?: string;
};

export default function HoldToOpenButton({ onHold, label = 'Hold to add water test' }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggered = useRef(false);
  const progress = useRef(new Animated.Value(0)).current;

  const start = () => {
    triggered.current = false;
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    timer.current = setTimeout(() => {
      triggered.current = true;
      onHold();
    }, 200);
  };

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (!triggered.current) {
      progress.stopAnimation();
      Animated.timing(progress, { toValue: 0, duration: 80, useNativeDriver: false }).start();
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPressIn={start}
      onPressOut={cancel}
      onPress={cancel}
      activeOpacity={0.8}
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.fill, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: '#1B1D26', borderRadius: 18, paddingVertical: 15, alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  fill: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(46, 140, 166, 0.55)' },
  text: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
