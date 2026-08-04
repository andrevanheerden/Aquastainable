import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { ThemeType, ThemeColors } from '../../types/theme';

interface WaveBackgroundProps {
  theme?: ThemeType;
  children?: ReactNode;
}

const THEME_COLORS: Record<ThemeType, ThemeColors> = {
  default: {
    bg: '#0F0920',
    top: '#6B21A8',
    bottom: '#1E0A3C',
  },
  midnight: {
    bg: '#030712',
    top: '#1E3A8A',
    bottom: '#091E42',
  },
  emerald: {
    bg: '#022C22',
    top: '#059669',
    bottom: '#064E3B',
  },
  crimson: {
    bg: '#1A0507',
    top: '#DC2626',
    bottom: '#7F1D1D',
  },
};

export default function WaveBackground({ theme = 'default', children }: WaveBackgroundProps) {
  const colors = THEME_COLORS[theme] || THEME_COLORS.default;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.top} stopOpacity="0.45" />
            <Stop offset="100%" stopColor={colors.bottom} stopOpacity="0.2" />
          </LinearGradient>
        </Defs>

        <Path
          d="M-50,200 C100,100 250,300 450,180 C600,80 700,250 800,200 L800,900 L-50,900 Z"
          fill="url(#waveGrad)"
        />
        <Path
          d="M-50,450 C120,380 220,520 400,420 C580,320 680,480 800,400 L800,900 L-50,900 Z"
          fill="url(#waveGrad)"
          opacity="0.6"
        />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});