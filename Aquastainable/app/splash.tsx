// SplashScreen.tsx
// Total redesign, matching the reference gif closely:
//
//   1. A drop stretches down from an invisible source at the top, thin at
//      first, elongating like it's being pulled down by gravity.
//   2. It pinches off — the bulb falls the rest of the way while the
//      stretched tail snaps back up and fades.
//   3. It lands, spreading into a puddle with an expanding ripple ring and
//      a couple of little bounce droplets.
//   4. Your logo fades in above the puddle it just made.
//   5. onFinish fires — hand off to your loading screen from there.
//
// Needs: react-native-svg
//   npm install react-native-svg
//   (bare RN: cd ios && pod install)
//
// Usage in App.tsx:
//   const [stage, setStage] = useState<'splash' | 'loading' | 'app'>('splash');
//   if (stage === 'splash') return <SplashScreen onFinish={() => setStage('loading')} />;
//   if (stage === 'loading') return <LoadingScreen progress={...} onDone={() => setStage('app')} />;
//   return <MainApp />;

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import Svg, { Path, Ellipse, Circle } from 'react-native-svg';
import Colors from './colors';

type Props = {
  onFinish?: () => void;
};

const STAGE_W = 200;
const STAGE_H = 260;

const STRETCH_TOP = 8; // where the stretching tail starts from
const STRETCH_MAX_H = 128; // how far it elongates before pinching off
const BULB_Y = STRETCH_TOP + STRETCH_MAX_H; // where the falling drop starts
const PUDDLE_Y = 216; // where it lands

const DROP_COLOR = Colors.info; // bright brand blue
const RIPPLE_COLOR = Colors.lightBlue;

const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  // phase 1: the stretching tail
  const stretchH = useRef(new Animated.Value(0)).current;
  const stretchOpacity = useRef(new Animated.Value(1)).current;

  // phase 2: the falling drop
  const fallY = useRef(new Animated.Value(0)).current;
  const fallOpacity = useRef(new Animated.Value(0)).current;

  // phase 3: puddle + ripple + bounce droplets
  const puddleScale = useRef(new Animated.Value(0)).current;
  const ripple = useRef(new Animated.Value(0)).current;
  const bounceL = useRef(new Animated.Value(0)).current;
  const bounceR = useRef(new Animated.Value(0)).current;

  // phase 4: the logo
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // 1) tail stretches downward, picking up speed
    Animated.timing(stretchH, {
      toValue: STRETCH_MAX_H,
      duration: 650,
      easing: Easing.in(Easing.quad),
      useNativeDriver: false, // animating height, not a transform
    }).start(() => {
      // 2) it pinches off — tail snaps back and fades, drop falls the rest of the way
      Animated.timing(stretchH, {
        toValue: 24,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
      Animated.timing(stretchOpacity, {
        toValue: 0,
        duration: 260,
        delay: 60,
        useNativeDriver: false,
      }).start();

      fallOpacity.setValue(1);
      Animated.timing(fallY, {
        toValue: PUDDLE_Y - BULB_Y,
        duration: 260,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        // 3) impact — puddle spreads, ripple expands, tiny droplets bounce
        fallOpacity.setValue(0);

        Animated.sequence([
          Animated.spring(puddleScale, { toValue: 1.1, friction: 4, useNativeDriver: true }),
          Animated.spring(puddleScale, { toValue: 1, friction: 5, useNativeDriver: true }),
        ]).start();

        Animated.timing(ripple, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();

        const bounce = (val: Animated.Value) =>
          Animated.sequence([
            Animated.timing(val, { toValue: 1, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(val, { toValue: 0, duration: 220, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          ]);
        bounce(bounceL).start();
        Animated.sequence([Animated.delay(60), bounce(bounceR)]).start();

        // 4) the logo fades in above the puddle
        Animated.sequence([
          Animated.delay(280),
          Animated.parallel([
            Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(logoScale, { toValue: 1.1, duration: 220, useNativeDriver: true }),
              Animated.spring(logoScale, { toValue: 1, friction: 4, useNativeDriver: true }),
            ]),
          ]),
        ]).start();
      });
    });

    const finishTimer = setTimeout(() => {
      onFinish && onFinish();
    }, 3200);

    return () => clearTimeout(finishTimer);
  }, []);

  const rippleScale = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.8] });
  const rippleOpacity = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] });
  const bounceLY = bounceL.interpolate({ inputRange: [0, 1], outputRange: [0, -22] });
  const bounceRY = bounceR.interpolate({ inputRange: [0, 1], outputRange: [0, -16] });
  const bounceOpacity = (v: Animated.Value) => v.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={styles.container}>
      <View style={styles.stage}>
        {/* stretching tail, revealed top-down inside a clipped mask */}
        <Animated.View
          style={{
            position: 'absolute',
            top: STRETCH_TOP,
            left: STAGE_W / 2 - 10,
            width: 20,
            height: stretchH,
            overflow: 'hidden',
            opacity: stretchOpacity,
          }}
        >
          <Svg width={20} height={STRETCH_MAX_H} viewBox={`0 0 20 ${STRETCH_MAX_H}`}>
            <Path
              d={`M10 0 C11 ${STRETCH_MAX_H * 0.3} 9 ${STRETCH_MAX_H * 0.55} 9 ${STRETCH_MAX_H * 0.72}
                  C9 ${STRETCH_MAX_H * 0.72} 2 ${STRETCH_MAX_H * 0.82} 2 ${STRETCH_MAX_H * 0.92}
                  C2 ${STRETCH_MAX_H} 18 ${STRETCH_MAX_H} 18 ${STRETCH_MAX_H * 0.92}
                  C18 ${STRETCH_MAX_H * 0.82} 11 ${STRETCH_MAX_H * 0.72} 11 ${STRETCH_MAX_H * 0.72}
                  C11 ${STRETCH_MAX_H * 0.55} 9 ${STRETCH_MAX_H * 0.3} 10 0 Z`}
              fill={DROP_COLOR}
            />
          </Svg>
        </Animated.View>

        {/* the falling drop, once it pinches off */}
        <Animated.View
          style={{
            position: 'absolute',
            top: BULB_Y,
            left: STAGE_W / 2 - 9,
            opacity: fallOpacity,
            transform: [{ translateY: fallY }],
          }}
        >
          <Svg width={18} height={26} viewBox="0 0 18 26">
            <Path
              d="M9 0 C9 0 1 12 1 18 C1 22.5 4.5 26 9 26 C13.5 26 17 22.5 17 18 C17 12 9 0 9 0 Z"
              fill={DROP_COLOR}
            />
          </Svg>
        </Animated.View>

        {/* impact: ripple, puddle, bounce droplets */}
        <View style={{ position: 'absolute', top: PUDDLE_Y - 30, left: STAGE_W / 2 - 60, width: 120, height: 60 }}>
          <Animated.View
            style={{
              position: 'absolute',
              top: 22,
              left: 10,
              opacity: rippleOpacity,
              transform: [{ scale: rippleScale }],
            }}
          >
            <Svg width={100} height={30} viewBox="0 0 100 30">
              <Ellipse cx="50" cy="15" rx="48" ry="12" fill="none" stroke={RIPPLE_COLOR} strokeWidth={1.5} />
            </Svg>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: puddleScale }] }}>
            <Svg width={120} height={60} viewBox="0 0 120 60">
              <Ellipse cx="60" cy="34" rx="44" ry="16" fill={DROP_COLOR} />
            </Svg>
          </Animated.View>

          <Animated.View
            style={{
              position: 'absolute',
              top: 16,
              left: 14,
              opacity: bounceOpacity(bounceL),
              transform: [{ translateY: bounceLY }],
            }}
          >
            <Svg width={8} height={8} viewBox="0 0 8 8">
              <Circle cx="4" cy="4" r="4" fill={DROP_COLOR} />
            </Svg>
          </Animated.View>

          <Animated.View
            style={{
              position: 'absolute',
              top: 18,
              left: 98,
              opacity: bounceOpacity(bounceR),
              transform: [{ translateY: bounceRY }],
            }}
          >
            <Svg width={6} height={6} viewBox="0 0 6 6">
              <Circle cx="3" cy="3" r="3" fill={DROP_COLOR} />
            </Svg>
          </Animated.View>
        </View>

        {/* the logo, appearing above the puddle it made */}
        <Animated.View
          style={[
            styles.logoAnchor,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <Image source={require('../assets/logo/Aque-logo.png')} style={styles.logo} resizeMode="contain" />
        </Animated.View>
      </View>
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
  stage: {
    width: STAGE_W,
    height: STAGE_H,
  },
  logoAnchor: {
    position: 'absolute',
    top: PUDDLE_Y - 130,
    left: STAGE_W / 2 - 55,
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
});

export default SplashScreen;