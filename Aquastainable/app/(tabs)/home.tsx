// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ImageBackground,
  PanResponder,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors from '../colors';

const aquariumImage1 = require('../../assets/fishTank/FishTankForest.jpeg');
const aquariumImage2 = require('../../assets/fishTank/FishTankLiveingRoom.jpeg');
const aquariumImage3 = require('../../assets/fishTank/FishTankTree.jpeg');

type AquariumData = {
  tankId: string;
  name: string;
  tankSizeGallons: number;
  waterTempC: number;
  nextWaterChangeDays: number;
  aiSafetyStatus: 'Optimal' | 'Attention Required' | 'Critical';
  photoUrl: string | number;
};

const MOCK_AQUARIUMS: AquariumData[] = [
  {
    tankId: '1',
    name: 'Amazonian Reef Tank',
    tankSizeGallons: 45,
    waterTempC: 25.4,
    nextWaterChangeDays: 3,
    aiSafetyStatus: 'Optimal',
    photoUrl: aquariumImage1,
  },
  {
    tankId: '2',
    name: 'Nano Betta Sanctuary',
    tankSizeGallons: 10,
    waterTempC: 26.1,
    nextWaterChangeDays: 1,
    aiSafetyStatus: 'Attention Required',
    photoUrl: aquariumImage2,
  },
  {
    tankId: '3',
    name: 'Treehouse Aquascape',
    tankSizeGallons: 30,
    waterTempC: 24.8,
    nextWaterChangeDays: 4,
    aiSafetyStatus: 'Optimal',
    photoUrl: aquariumImage3,
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  // gentle bounce on the chevron to hint "there's more here"
  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: 550, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 550, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const bounceY = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 20,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -40) {
          setActiveIndex((prev) => (prev + 1) % MOCK_AQUARIUMS.length);
        } else if (gestureState.dy > 40) {
          setActiveIndex((prev) => (prev - 1 + MOCK_AQUARIUMS.length) % MOCK_AQUARIUMS.length);
        }
      },
    })
  ).current;

  const aquarium = MOCK_AQUARIUMS[activeIndex];
  const currentNumber = activeIndex + 1;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ImageBackground
        source={typeof aquarium.photoUrl === 'string' ? { uri: aquarium.photoUrl } : aquarium.photoUrl}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlayGradient} />

        <SafeAreaView style={styles.contentContainer}>
          <View style={styles.topHeader}>
            <Text style={styles.brandTitle}>AQUASTAINABLE</Text>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>{String(currentNumber).padStart(2, '0')} / {MOCK_AQUARIUMS.length}</Text>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.statusBadgeContainer}>
              <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.statusText}>{aquarium.aiSafetyStatus}</Text>
            </View>

            <Text style={styles.aquariumTitle}>{aquarium.name}</Text>

            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>WATER TEMP</Text>
                <Text style={styles.metricValue}>{aquarium.waterTempC}°C</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>NEXT CHANGE</Text>
                <Text style={styles.metricValue}>{aquarium.nextWaterChangeDays} Days</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>VOLUME</Text>
                <Text style={styles.metricValue}>{aquarium.tankSizeGallons} Gal</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.tankInfoButton}
              activeOpacity={0.85}
              onPress={() => router.push(`/tank/${aquarium.tankId}`)}
            >
              <View style={styles.swipeIndicator}>
                <View style={styles.swipeHandle} />
                <Text style={styles.swipeHint}>Swipe up</Text>
              </View>

              <View style={styles.tankInfoTextWrap}>
                <Text style={styles.tankInfoTitle}>Tank info</Text>
                <Text style={styles.tankInfoSubtitle}>Species, conditions & care tips</Text>
              </View>

              <Animated.View style={[styles.chevronWrap, { transform: [{ translateY: bounceY }] }]}> 
                <IconSymbol name="chevron.up" size={18} color={Colors.white} />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22, 21, 26, 0.55)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  pagePill: {
    backgroundColor: 'rgba(18, 18, 18, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pagePillText: {
    color: Colors.lightBlue,
    fontSize: 12,
    fontWeight: '700',
  },
  bottomSection: {
    marginBottom: 20,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  aquariumTitle: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.82)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricLabel: {
    color: Colors.gray,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metricValue: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  tankInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
  },
  swipeIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  swipeHandle: {
    width: 26,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    marginBottom: 8,
  },
  swipeHint: {
    color: Colors.gray,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tankInfoTextWrap: {
    flex: 1,
  },
  tankInfoTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  tankInfoSubtitle: {
    color: Colors.lightBlue,
    fontSize: 12,
  },

});