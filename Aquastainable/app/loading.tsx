

import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import Svg, { Path, Rect, G, Defs, ClipPath, Circle } from 'react-native-svg';
import Colors from './colors';

type Props = {
  progress?: number; 
  label?: string; 
  duration?: number; 
};

const SIZE = 260;
const R = 120;
const CX = SIZE / 2;
const CY = SIZE / 2;

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const LoadingScreen: React.FC<Props> = ({ progress, label, duration = 3000 }) => {
  const router = useRouter();
  const fill = useRef(new Animated.Value(0)).current; // 0-100
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    const id = fill.addListener(({ value }) => setDisplayPercent(Math.round(value)));
    return () => fill.removeListener(id);
  }, []);

  useEffect(() => {
    if (progress !== undefined) {
      Animated.timing(fill, {
        toValue: Math.max(0, Math.min(100, progress)),
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false, // animating SVG attributes, not transforms
      }).start();
    } else {
      fill.setValue(0);
      Animated.timing(fill, {
        toValue: 100,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [duration, fill, progress]);

  useEffect(() => {
    if (progress !== undefined) {
      if (progress >= 100) {
        router.replace('/(tabs)/home');
      }
      return;
    }

    const timeout = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, duration);

    return () => clearTimeout(timeout);
  }, [duration, progress, router]);

  // y = CY + R at 0% (fully below the circle, so nothing shows)
  // y = CY - R at 100% (fully above the circle, so it's completely full)
  const waterY = fill.interpolate({ inputRange: [0, 100], outputRange: [CY + R, CY - R] });

  const waveD = fill.interpolate({
    inputRange: [0, 100],
    outputRange: [
      `M0 ${CY + R} Q ${SIZE / 4} ${CY + R - 6} ${SIZE / 2} ${CY + R} T ${SIZE} ${CY + R} L ${SIZE} ${CY + R + 10} L 0 ${CY + R + 10} Z`,
      `M0 ${CY - R} Q ${SIZE / 4} ${CY - R - 6} ${SIZE / 2} ${CY - R} T ${SIZE} ${CY - R} L ${SIZE} ${CY - R + 10} L 0 ${CY - R + 10} Z`,
    ],
  });

  return (
    <View style={styles.container}>
      <View style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Defs>
            <ClipPath id="circleClip">
              <Circle cx={CX} cy={CY} r={R} />
            </ClipPath>
          </Defs>

          <G clipPath="url(#circleClip)">
            <AnimatedRect x={0} y={waterY} width={SIZE} height={SIZE} fill={Colors.waterFill} />
            {/* the pale, slightly wavy surface line right at the top of the water */}
            <AnimatedPath d={waveD} fill={Colors.waterFillLight} />
          </G>
        </Svg>

        <Text style={styles.percent}>{displayPercent}%</Text>
      </View>

      {!!label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: Colors.info,
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 1,
  },
  label: {
    color: Colors.gray,
    fontSize: 13,
    marginTop: 20,
    letterSpacing: 0.5,
  },
});

export default LoadingScreen;