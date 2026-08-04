import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../app/colors';
import { ThemeType, ThemeColors } from '../../app/theme';

interface WaveBackgroundProps {
  theme?: ThemeType;
  children?: ReactNode;
}

const THEME_COLORS: Record<ThemeType, ThemeColors> = {
  default: {
    bg: Colors.background,
    top: Colors.waterFillLight,
    bottom: Colors.info,
  },
  midnight: {
    bg: Colors.background,
    top: Colors.waterFillLight,
    bottom: Colors.info,
  },
  emerald: {
    bg: Colors.background,
    top: Colors.waterFillLight,
    bottom: Colors.info,
  },
  crimson: {
    bg: Colors.background,
    top: Colors.waterFillLight,
    bottom: Colors.info,
  },
};

export default function WaveBackground({ theme = 'default', children }: WaveBackgroundProps) {
  const colors = THEME_COLORS[theme] || THEME_COLORS.default;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.auroraLayer, styles.auroraOne, { backgroundColor: colors.top }]} />
      <View style={[styles.auroraLayer, styles.auroraTwo, { backgroundColor: colors.bottom }]} />
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.12)' }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  auroraLayer: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.35,
    filter: 'blur(60px)',
  },
  auroraOne: {
    top: -70,
    left: -80,
    width: 220,
    height: 220,
    transform: [{ rotate: '-15deg' }],
  },
  auroraTwo: {
    bottom: -120,
    right: -90,
    width: 260,
    height: 260,
    transform: [{ rotate: '25deg' }],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});