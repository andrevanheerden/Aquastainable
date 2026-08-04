import React from 'react';
import { StyleSheet, View, Text, Image, ImageSourcePropType } from 'react-native';

interface HeroSectionProps {
  logoSource?: ImageSourcePropType | null;
}

export default function HeroSection({ logoSource }: HeroSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.outerGlow}>
        <View style={styles.innerCircle}>
          {logoSource ? (
            <Image source={logoSource} style={styles.logo} resizeMode="contain" />
          ) : (
            <View style={styles.logoPlaceholder} />
          )}
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
  outerGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  innerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
  logoPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#A855F7',
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