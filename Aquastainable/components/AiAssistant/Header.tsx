import React, { useRef } from 'react';
import { Animated, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const AnimatedView = Animated.View as React.ComponentType<any>;

export function HoldIconButton({ onHold, icon, label, fillColor = 'rgba(46, 140, 166, 0.75)', iconColor = '#FFFFFF' }: { onHold: () => void; icon: any; label: string; fillColor?: string; iconColor?: string }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progress = useRef(new Animated.Value(0)).current;

  const start = () => {
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 20, useNativeDriver: false }).start();
    timer.current = setTimeout(() => {
      onHold();
    }, 20);
  };

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    Animated.timing(progress, { toValue: 0, duration: 100, useNativeDriver: false }).start();
  };

  return (
    <TouchableOpacity
      style={styles.iconButton}
      onPressIn={start}
      onPressOut={cancel}
      onPress={cancel}
      activeOpacity={0.75}
      accessibilityLabel={label}
    >
      <AnimatedView style={[styles.holdFill, { backgroundColor: fillColor, transform: [{ scaleX: progress }] }]} pointerEvents="none" />
      <View style={styles.iconContent} pointerEvents="none">
        <Feather name={icon} size={20} color={iconColor} />
      </View>
    </TouchableOpacity>
  );
}

export default function Header({ onMenu }: { onMenu?: () => void }) {
  return (
    <View style={styles.container}>
      <HoldIconButton onHold={onMenu ?? (() => {})} icon="menu" label="Hold to open chat history" />

      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  holdFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(46, 140, 166, 0.75)',
    transformOrigin: 'left',
  },
  iconContent: {
    zIndex: 1,
  },
  spacer: {
    width: 44,
  },
});