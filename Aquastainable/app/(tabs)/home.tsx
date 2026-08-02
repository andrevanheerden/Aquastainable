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

const SWIPE_THUMB_SIZE = 52;
const SWIPE_PADDING = 4;

// Interactive Horizontal Swipe Button Component
function SwipeButton({ onSwipe }: { onSwipe: () => void }) {
  const pan = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  const maxTranslate = Math.max(0, containerWidth - SWIPE_THUMB_SIZE - SWIPE_PADDING * 2);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (_, gestureState) => {
        const newValue = Math.max(0, Math.min(gestureState.dx, maxTranslate));
        pan.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= maxTranslate * 0.75) {
          // Snap to end and trigger callback
          Animated.timing(pan, {
            toValue: maxTranslate,
            duration: 120,
            useNativeDriver: true,
          }).start(() => {
            onSwipe();
            // Reset thumb position after navigating
            setTimeout(() => {
              Animated.spring(pan, {
                toValue: 0,
                friction: 6,
                useNativeDriver: true,
              }).start();
            }, 600);
          });
        } else {
          // Snap back to start if released early
          Animated.spring(pan, {
            toValue: 0,
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Fade out text as the button is dragged
  const textOpacity = pan.interpolate({
    inputRange: [0, maxTranslate * 0.5 || 1],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={styles.swipeTrack}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Animated.Text style={[styles.swipeText, { opacity: textOpacity }]}>
        SWIPE FOR TANK INFO
      </Animated.Text>
      
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.swipeThumb,
          {
            transform: [{ translateX: pan }],
          },
        ]}
      >
        <IconSymbol name="chevron.right" size={22} color={Colors.white} />
      </Animated.View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  // Vertical Screen Swipe Gesture (Switch Aquariums)
  const screenPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
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
    <View style={styles.container} {...screenPanResponder.panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ImageBackground
        source={typeof aquarium.photoUrl === 'string' ? { uri: aquarium.photoUrl } : aquarium.photoUrl}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlayGradient} />

        <SafeAreaView style={styles.contentContainer}>
          {/* Top Header */}
          <View style={styles.topHeader}>
            <Text style={styles.brandTitle}>AQUASTAINABLE</Text>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>
                {String(currentNumber).padStart(2, '0')} / {MOCK_AQUARIUMS.length}
              </Text>
            </View>
          </View>

          {/* Bottom Card Content */}
          <View style={styles.bottomSection}>
            <View style={styles.statusBadgeContainer}>
              <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.statusText}>{aquarium.aiSafetyStatus}</Text>
            </View>

            <Text style={styles.aquariumTitle}>{aquarium.name}</Text>

            {/* Metrics Row */}
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

            {/* Interactive Swipe Button */}
            <SwipeButton onSwipe={() => router.push(`/tank/${aquarium.tankId}`)} />
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
    justify: 'space-between',
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

  /* Swipe Button Styles */
  swipeTrack: {
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 30,
    justifyContent: 'center',
    padding: SWIPE_PADDING,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
  },
  swipeText: {
    position: 'absolute',
    alignSelf: 'center',
    color: Colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  swipeThumb: {
    width: SWIPE_THUMB_SIZE,
    height: SWIPE_THUMB_SIZE,
    borderRadius: SWIPE_THUMB_SIZE / 2,
    backgroundColor: Colors.primary || '#3B82F6',
    alignItems: 'center',
    justify: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});