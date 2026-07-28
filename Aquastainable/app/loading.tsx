// Simple black & white line-art fish tank that fills up as a loading indicator.
// Water level = percentage loaded. A little fish swims back and forth while it fills.
// No extra libraries needed — just react-native core.
//
// Usage (controlled, e.g. tied to a real upload/fetch progress):
//   <LoadingScreen progress={uploadProgress} label="Analyzing your tank..." />
//
// Usage (uncontrolled demo — just animates 0 to 100 on its own):
//   <LoadingScreen label="Loading..." />

import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Colors from "./colors";

type Props = {
  progress?: number; // 0-100, pass this if you want to control it externally
  label?: string;
  duration?: number; // only used in uncontrolled/demo mode
};

const TANK_WIDTH = 180;
const TANK_HEIGHT = 220;

const LoadingScreen: React.FC<Props> = ({
  progress,
  label = "Loading your tank...",
  duration = 3000,
}) => {
  const waterAnim = useRef(new Animated.Value(0)).current;
  const fishX = useRef(new Animated.Value(0)).current;
  const [displayPercent, setDisplayPercent] = useState(0);
  const [facingRight, setFacingRight] = useState(true);

  // Track the visible number for the "xx%" label
  useEffect(() => {
    const id = waterAnim.addListener(({ value }) => {
      setDisplayPercent(Math.round(value));
    });
    return () => waterAnim.removeListener(id);
  }, []);

  // Drive the water level either from external progress, or a self-playing demo loop
  useEffect(() => {
    if (progress !== undefined) {
      Animated.timing(waterAnim, {
        toValue: Math.max(0, Math.min(100, progress)),
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
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

  // Fish swims side to side, forever, flipping direction at each edge
  useEffect(() => {
    const swimRange = TANK_WIDTH - 70;

    const swim = () => {
      setFacingRight(true);
      Animated.timing(fishX, {
        toValue: swimRange,
        duration: 2200,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }).start(() => {
        setFacingRight(false);
        Animated.timing(fishX, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }).start(swim);
      });
    };

    swim();
  }, []);

  const waterHeight = waterAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, TANK_HEIGHT - 6],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.percent}>{displayPercent}%</Text>

      <View style={styles.tank}>
        {/* water fill, rising from the bottom */}
        <Animated.View style={[styles.water, { height: waterHeight }]}>
          <View style={styles.waterSurface} />
        </Animated.View>

        {/* little swimming fish */}
        <Animated.View
          style={[
            styles.fish,
            {
              bottom: 20,
              transform: [
                { translateX: fishX },
                { scaleX: facingRight ? 1 : -1 },
              ],
            },
          ]}
        >
          <View style={styles.fishBody} />
          <View style={styles.fishTail} />
          <View style={styles.fishEye} />
        </Animated.View>

        {/* a couple of simple decorative bubbles */}
        <View style={[styles.bubble, { left: 30, bottom: 40 }]} />
        <View
          style={[
            styles.bubble,
            { left: 130, bottom: 90, width: 6, height: 6 },
          ]}
        />
      </View>

      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  percent: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 18,
    letterSpacing: 1,
  },
  tank: {
    width: TANK_WIDTH,
    height: TANK_HEIGHT,
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  water: {
    width: "100%",
    backgroundColor: Colors.teal,
    opacity: 0.55,
  },
  waterSurface: {
    height: 3,
    width: "100%",
    backgroundColor: Colors.lightBlue,
    opacity: 0.8,
  },
  fish: {
    position: "absolute",
    width: 40,
    height: 20,
    justifyContent: "center",
  },
  fishBody: {
    width: 28,
    height: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.orange,
    backgroundColor: "transparent",
  },
  fishTail: {
    position: "absolute",
    left: -8,
    top: 3,
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderRightWidth: 9,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: Colors.orange,
  },
  fishEye: {
    position: "absolute",
    right: 4,
    top: 5,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.white,
  },
  bubble: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.lightBlue,
    opacity: 0.6,
  },
  label: {
    color: Colors.gray,
    fontSize: 13,
    marginTop: 20,
    letterSpacing: 0.5,
  },
});

export default LoadingScreen;
