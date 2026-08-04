// app/(tabs)/tank.tsx
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import HeaderRow from '@/components/tank/HeaderRow';
import OverviewSection from '@/components/tank/OverviewSection';
import NeedToKnow from '@/components/tank/NeedToKnow';
import FishPlants from '@/components/tank/FishPlants';
import WaterTestCard from '@/components/tank/WaterTestCard';
import Colors from '../colors';
import { getTankDetail, Species } from '../data/tankDetails';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 16;
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_STRIDE = CARD_WIDTH + CARD_GAP;
const TILE_GAP = 16;
const TILE_WIDTH = (SCREEN_WIDTH - 40 - TILE_GAP) / 2;
const TILE_HEIGHT = 250;

// Sample internet image URLs for fish & aquatic species thumbnails & preview
const SPECIES_IMAGES = [
  'https://i.pinimg.com/736x/d1/eb/64/d1eb6494b3aa36fd9da9e5d7423ab1ca.jpg',
  'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=800&auto=format&fit=crop&q=80',
];

function getSpeciesImage(index: number) {
  return SPECIES_IMAGES[index % SPECIES_IMAGES.length];
}

// ConditionTile and SpeciesCard moved to components/tank/

export default function TankInfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const tank = getTankDetail(id ?? '');

  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set((tank?.species ?? []).filter((s) => s.favorite).map((s) => s.id))
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const speciesListRef = useRef<FlatList<Species>>(null);

  if (!tank) {
    return (
      <SafeAreaView style={styles.missingContainer}>
        <Text style={styles.missingText}>We couldn't find that tank.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLinkButton}>
          <Text style={styles.backLinkText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const toggleFavorite = (speciesId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(speciesId)) next.delete(speciesId);
      else next.add(speciesId);
      return next;
    });
  };

  const goToIndex = (index: number) => {
    setActiveIndex(index);
    speciesListRef.current?.scrollToOffset({ offset: index * CARD_STRIDE, animated: true });
  };

  const onSpeciesScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / CARD_STRIDE);
    setActiveIndex(Math.max(0, Math.min(tank.species.length - 1, index)));
  };

  const activeSpecies = tank.species[activeIndex] || tank.species[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121214" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <HeaderRow onBack={() => router.back()} onMenu={() => {}} />

          {/* Title + Scientific Subtitle */}
          <Text style={styles.tankName}>{activeSpecies.name}</Text>
          <Text style={styles.tankSubtitle}>{activeSpecies.speciesName}</Text>

          {/* Hero Image Section */}
          <View style={styles.hero}>
            <View style={styles.heroSideColumn}>
              <View style={styles.heroThumbStack}>
                {tank.species.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => goToIndex(index)}
                    style={[
                      styles.heroSmallThumb,
                      index !== 0 && styles.heroSmallThumbSpacing,
                      index === activeIndex && styles.heroSmallThumbSelected,
                    ]}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{ uri: getSpeciesImage(index) }}
                      style={styles.heroSmallThumbImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.heroPreviewContainer}>
              <View style={styles.heroPreviewBackground}>
                <Image
                  source={{ uri: getSpeciesImage(activeIndex) }}
                  style={styles.heroPreviewBackgroundImage}
                  blurRadius={24}
                />
                <View style={styles.heroPreviewOverlay} />
              </View>
              <View style={styles.heroCircleContainer}>
                <View style={styles.heroCircleGlow} />
                <Image
                  source={{ uri: getSpeciesImage(activeIndex) }}
                  style={styles.heroCircleImage}
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>

          <OverviewSection overview={tank.overviewSummary} />

          <NeedToKnow conditions={tank.conditions} />

          <WaterTestCard conditions={tank.conditions} />

          <FishPlants
            species={tank.species}
            speciesListRef={speciesListRef}
            getSpeciesImage={getSpeciesImage}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            cardWidth={CARD_WIDTH}
            cardStride={CARD_STRIDE}
            onSpeciesScrollEnd={onSpeciesScrollEnd}
          />

          {/* Pagination Dots */}
          {tank.species.length > 1 && (
            <View style={styles.dotsRow}>
              {tank.species.map((s, i) => (
                <TouchableOpacity key={s.id} onPress={() => goToIndex(i)} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
                  <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Action Button removed per request */}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const HERO_HEIGHT = 260;
const THUMB_SIZE = 58;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  tankName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  
  tankSubtitle: {
    color: '#6E6E73',
    fontSize: 15,
    marginTop: 4,
    marginBottom: 20,
  },

  // Hero Section
  hero: {
    height: HERO_HEIGHT,
    marginBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'visible',
  },
  heroSideColumn: {
    width: 90,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  heroThumbStack: {
    marginTop: 8,
  },
  heroSmallThumb: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
  },
  heroSmallThumbSpacing: {
    marginTop: 16,
  },
  heroSmallThumbSelected: {
    borderWidth: 2,
    borderColor: '#5B8CFF',
  },
  heroSmallThumbImage: {
    width: '100%',
    height: '100%',
  },
  heroPreviewContainer: {
    width: HERO_HEIGHT * 1.1,
    height: HERO_HEIGHT * 1.1,
    borderRadius: (HERO_HEIGHT * 1.1) / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -40,
  },
  heroPreviewBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  heroPreviewBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.62,
  },
  heroPreviewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 17, 24, 0.45)',
  },
  heroCircleContainer: {
    width: '100%',
    height: '100%',
    borderRadius: (HERO_HEIGHT * 1.1) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A2638',
    shadowOffset: { width: 0, height: 26 },
    shadowOpacity: 0.28,
    shadowRadius: 42,
    elevation: 20,
    overflow: 'hidden',
  },
  heroCircleGlow: {
    position: 'absolute',
    width: '150%',
    height: '150%',
    borderRadius: 999,
    backgroundColor: 'rgba(91, 140, 255, 0.18)',
    transform: [{ scale: 1.12 }],
  },
  heroCircleImage: {
    width: '100%',
    height: '100%',
    borderRadius: (HERO_HEIGHT * 1.1) / 2,
  },

  // Section Headers & Text
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    justify: 'center',
    marginTop: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3A3A3C',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 16,
  },

  // Action Button removed

  // Missing screen fallback
  missingContainer: {
    flex: 1,
    backgroundColor: '#121214',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
  },
  backLinkButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backLinkText: {
    color: '#8E8E93',
    fontSize: 14,
  },
});
