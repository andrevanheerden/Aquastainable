// Animated splash screen for Aquastainable.
// Drop "aque-logo.png" into your assets folder and fix the require() path below.
//
// Usage in App.tsx:
//   const [showSplash, setShowSplash] = useState(true);
//   return showSplash
//     ? <SplashScreen onFinish={() => setShowSplash(false)} />
//     : <MainApp />;

import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, View } from "react-native";
import Colors from "./colors";

type Props = {
  onFinish?: () => void;
};

const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  // Two expanding "ripple" rings behind the logo, like water rings
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo pops in
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // App name fades in slightly after the logo
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 600,
      delay: 400,
      useNativeDriver: true,
    }).start();

    // Ripple rings loop continuously
    const rippleLoop = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );

    rippleLoop(ring1, 0).start();
    rippleLoop(ring2, 900).start();

    // Move on to the main app after the splash has had its moment
    const timer = setTimeout(() => {
      onFinish && onFinish();
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  const ringStyle = (value: Animated.Value, color: string) => ({
    opacity: value.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    }),
    transform: [
      {
        scale: value.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2.4],
        }),
      },
    ],
    borderColor: color,
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Animated.View style={[styles.ring, ringStyle(ring1, Colors.teal)]} />
        <Animated.View style={[styles.ring, ringStyle(ring2, Colors.orange)]} />

        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        >
          <Image
            source={require("../assets/img/Aque-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <Animated.Text style={[styles.title, { opacity: textOpacity }]}>
        Aquastainable
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: textOpacity }]}>
        Sight-driven ecosystem care
      </Animated.Text>
    </View>
  );
};

const RING_SIZE = 160;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  ring: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
  },
  logo: {
    width: 110,
    height: 110,
  },
  title: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 1,
    // If you've linked the Montserrat font, swap this in:
    // fontFamily: 'Montserrat-Bold',
  },
  subtitle: {
    color: Colors.lightBlue,
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
