// LoadingScreen.tsx
// A rounded glass fishbowl that fills with colored water as your percentage loads,
// with a proper little goldfish (fins, tail, eye) swimming inside.
//
// Needs: react-native-svg
//   npm install react-native-svg
//   (bare RN: cd ios && pod install)
//
// Usage (controlled, tied to a real upload/fetch progress):
//   <LoadingScreen progress={uploadProgress} label="Analyzing your tank..." />
//
// Usage (uncontrolled demo — animates 0 to 100 on its own):
//   <LoadingScreen label="Loading..." />

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import Svg, {
  Path,
  Ellipse,
  Circle,
  Rect,
  G,
  Defs,
  ClipPath,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import Colors from './colors';

type Props = {
  progress?: number; // 0-100, pass this if you want to control it externally
  label?: string;
  duration?: number; // only used in uncontrolled/demo mode
};

const BOWL_W = 220;
const BOWL_H = 240;

// Silhouette of a classic rounded fishbowl — flared rim, bulging belly, rounded base.
const BOWL_PATH = `
  M60 34
  Q48 14 74 8
  Q110 -2 146 8
  Q172 14 160 34
  Q198 58 198 118
  Q198 190 146 216
  Q110 230 74 216
  Q22 190 22 118
  Q22 58 60 34
  Z
`;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

// A little bubble that floats up and fades, looping forever.
const Bubble: React.FC<{ left: number; delay: number; size: number }> = ({ left, delay, size }) => {
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      rise.setValue(0);
      Animated.timing(rise, {
        toValue: 1,
        duration: 2600,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(loop);
    };
    loop();
  }, []);

  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [0, -90] });
  const opacity = rise.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 0.8, 0.6, 0] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left,
        bottom: 30,
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: Colors.glass,
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
};

const LoadingScreen: React.FC<Props> = ({ progress, label = 'Loading your tank...', duration = 3000 }) => {
  const waterAnim = useRef(new Animated.Value(0)).current;
  const fishX = useRef(new Animated.Value(0)).current;
  const fishBob = useRef(new Animated.Value(0)).current;
  const [displayPercent, setDisplayPercent] = useState(0);
  const [facingRight, setFacingRight] = useState(true);

  // Track the visible number for the "xx%" label
  useEffect(() => {
    const id = waterAnim.addListener(({ value }) => setDisplayPercent(Math.round(value)));
    return () => waterAnim.removeListener(id);
  }, []);

  // Drive the water level either from external progress, or a self-playing demo loop
  useEffect(() => {
    if (progress !== undefined) {
      Animated.timing(waterAnim, {
        toValue: Math.max(0, Math.min(100, progress)),
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false, // animating an SVG attribute, not a transform
      }).start();
    } else {
      waterAnim.setValue(0);
      Animated.timing(waterAnim, {
        toValue: 100,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [progress]);

  // Fish swims side to side forever, with a gentle up/down bob
  useEffect(() => {
    const swimRange = BOWL_W - 130;

    const swim = () => {
      setFacingRight(true);
      Animated.timing(fishX, {
        toValue: swimRange,
        duration: 2400,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }).start(() => {
        setFacingRight(false);
        Animated.timing(fishX, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }).start(swim);
      });
    };
    swim();

    Animated.loop(
      Animated.sequence([
        Animated.timing(fishBob, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(fishBob, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Water rect sits below the bowl when empty, and rises up as it "fills"
  const emptyY = BOWL_H + 10;
  const fullY = 40;
  const waterY = waterAnim.interpolate({ inputRange: [0, 100], outputRange: [emptyY, fullY] });
  const bobY = fishBob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <View style={styles.container}>
      <Text style={styles.percent}>{displayPercent}%</Text>

      <View style={{ width: BOWL_W, height: BOWL_H }}>
        <Svg width={BOWL_W} height={BOWL_H} viewBox={`0 0 220 240`}>
          <Defs>
            <ClipPath id="bowlClip">
              <Path d={BOWL_PATH} />
            </ClipPath>
            <LinearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={Colors.lightBlue} stopOpacity={0.85} />
              <Stop offset="1" stopColor={Colors.teal} stopOpacity={0.92} />
            </LinearGradient>
          </Defs>

          {/* everything below is clipped to the bowl's silhouette */}
          <G clipPath="url(#bowlClip)">
            {/* pale glass tint so the bowl doesn't look empty/invisible before water arrives */}
            <Path d={BOWL_PATH} fill={Colors.glass} opacity={0.06} />

            {/* rising water */}
            <AnimatedRect x={0} y={waterY} width={220} height={260} fill="url(#waterGrad)" />
            <AnimatedRect x={0} y={waterY} width={220} height={4} fill={Colors.lightBlue} opacity={0.9} />

            {/* gravel bed */}
            <Ellipse cx="70" cy="205" rx="10" ry="6" fill={Colors.gravel} />
            <Ellipse cx="92" cy="210" rx="12" ry="7" fill={Colors.gravel} opacity={0.9} />
            <Ellipse cx="118" cy="207" rx="9" ry="5.5" fill={Colors.gravel} opacity={0.8} />
            <Ellipse cx="140" cy="203" rx="8" ry="5" fill={Colors.gravel} />

            {/* simple plant */}
            <Path
              d="M100 205 C94 185 104 165 98 148"
              stroke={Colors.plant}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M108 205 C114 188 104 168 112 150"
              stroke={Colors.plant}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
          </G>

          {/* glass outline drawn on top so it stays crisp over the water */}
          <Path d={BOWL_PATH} fill="none" stroke={Colors.white} strokeWidth={2.5} />
          {/* rim highlight ellipse, like light catching the glass edge */}
          <Ellipse cx="110" cy="26" rx="58" ry="10" fill="none" stroke={Colors.white} strokeWidth={1.5} opacity={0.6} />
        </Svg>

        {/* swimming goldfish, layered above the bowl artwork */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 70,
            left: 40,
            transform: [
              { translateX: fishX },
              { translateY: bobY },
              { scaleX: facingRight ? 1 : -1 },
            ],
          }}
        >
          <Svg width={70} height={44} viewBox="-35 -22 70 44">
            {/* tail fin */}
            <Path
              d="M-14 0 C-30 -16 -44 -10 -50 -20 C-42 -4 -42 4 -50 20 C-44 10 -30 16 -14 0 Z"
              fill={Colors.goldMid}
              stroke={Colors.goldDark}
              strokeWidth={1}
            />
            {/* dorsal fin */}
            <Path d="M-3 -11 L4 -11 L1 -20 Z" fill={Colors.goldMid} stroke={Colors.goldDark} strokeWidth={0.8} />
            {/* body */}
            <Ellipse cx="4" cy="0" rx="17" ry="11" fill={Colors.goldLight} stroke={Colors.goldDark} strokeWidth={1.2} />
            {/* pectoral fin */}
            <Path
              d="M6 6 C11 10 15 15 8 17 C4 12 3 8 6 6 Z"
              fill={Colors.goldMid}
              stroke={Colors.goldDark}
              strokeWidth={0.8}
            />
            {/* eye */}
            <Circle cx="14" cy="-3" r="2.4" fill="#2B1200" />
            <Circle cx="14.8" cy="-3.8" r="0.8" fill={Colors.white} />
          </Svg>
        </Animated.View>

        {/* rising bubbles */}
        <Bubble left={36} delay={0} size={7} />
        <Bubble left={150} delay={900} size={5} />
        <Bubble left={100} delay={1600} size={6} />
      </View>

      <Text style={styles.label}>{label}</Text>
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
    color: Colors.white,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 14,
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