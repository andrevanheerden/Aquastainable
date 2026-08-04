import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image, ImageSourcePropType, Animated, Easing } from 'react-native';

interface HeroSectionProps {
  logoSource?: ImageSourcePropType | null;
}

export default function HeroSection({ logoSource }: HeroSectionProps) {
  const pulse1 = React.useRef(new Animated.Value(1)).current;
  const pulse2 = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createPulse = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1.08,
            duration: 1800,
            delay,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.96,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    createPulse(pulse1, 0);
    createPulse(pulse2, 900);
  }, [pulse1, pulse2]);

  const imageSource = logoSource ?? require('../../assets/logo/Aque-logo.png');

  return (
    <View style={styles.container}>
      <View style={styles.orbit}>
        <Animated.View style={[styles.outerRing, { transform: [{ scale: pulse1 }] }]} />
        <Animated.View style={[styles.middleRing, { transform: [{ scale: pulse2 }] }]} />
        <View style={styles.centerCircle}>
          <Image source={imageSource} style={styles.logo} resizeMode="contain" />
        </View>
      </View>

      <Text style={styles.title}>Hi, I'm Aquestanable.</Text>
      <Text style={styles.subtitle}>How can I help you today?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 25,
  },
  orbit: {
    width: 170,
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  outerRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  middleRing: {
    position: 'absolute',
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  centerCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  logo: {
    width: 54,
    height: 54,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});