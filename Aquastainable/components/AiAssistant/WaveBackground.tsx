import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { Colors } from '../../app/colors';
import { ThemeType, ThemeColors } from '../../app/theme';

interface WaveBackgroundProps {
  theme?: ThemeType;
  children?: ReactNode;
}

const THEME_COLORS: Record<ThemeType, ThemeColors> = {
  default: {
    bg: '#062B34',
    top: Colors.waterFill,
    bottom: Colors.waterFillLight,
  },
  midnight: {
    bg: '#042C39',
    top: Colors.waterFill,
    bottom: Colors.waterFillLight,
  },
  emerald: {
    bg: '#073B45',
    top: Colors.waterFill,
    bottom: Colors.waterFillLight,
  },
  crimson: {
    bg: '#052D3A',
    top: Colors.waterFill,
    bottom: Colors.waterFillLight,
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