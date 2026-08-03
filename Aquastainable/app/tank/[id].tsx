// app/tank/[id].tsx
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

import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors from '../colors';
import { getTankDetail, Species } from '../data/tankDetails';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 16;
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_STRIDE = CARD_WIDTH + CARD_GAP;

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

// "Need to know" card tile matching reference layout
function ConditionTile({
  label,
  value,
  iconName,
  accentColor = '#8A7CFF',
}: {
  label: string;
  value: string;
  iconName: string;
  accentColor?: string;
}) {
  return (
    <View style={styles.conditionTile}>
      <Text style={styles.conditionTileLabel}>{label}</Text>
      <View style={styles.conditionIconContainer}>
        <IconSymbol name={iconName} size={36} color={accentColor} />
      </View>
      <Text style={styles.conditionTileValue}>{value}</Text>
    </View>
  );
}

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
          
          {/* Header Row: Back Chevron + Ellipsis Menu */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol name="chevron.left" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {}}
              style={styles.headerButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol name="ellipsis" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

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

          {/* Overview Section */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overviewText}>{tank.overviewSummary}</Text>

          {/* Need to know / Tank Conditions Section */}
          <Text style={styles.sectionTitle}>Need to know</Text>
          <View style={styles.conditionsGrid}>
            <ConditionTile
              label="Water temp"
              value={`${tank.conditions.preferredTempC}`}
              iconName="thermometer"
              accentColor="#E57373"
            />
            <ConditionTile
              label="Living Area"
              value={tank.conditions.waterQuality}
              iconName="leaf.fill"
              accentColor="#81C784"
            />
            <ConditionTile
              label="pH Level"
              value={tank.conditions.ph}
              iconName="drop.fill"
              accentColor="#64B5F6"
            />
            <ConditionTile
              label="Last tested"
              value={tank.conditions.lastTestedDaysAgo === 0 ? 'Today' : `${tank.conditions.lastTestedDaysAgo}d ago`}
              iconName="clock.fill"
              accentColor="#FFB74D"
            />
          </View>

          {/* Fish & Plants Horizontal Carousel */}
          <Text style={styles.sectionTitle}>Fish & plants</Text>
          <FlatList
            ref={speciesListRef}
            data={tank.species}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            snapToInterval={CARD_STRIDE}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onSpeciesScrollEnd}
            contentContainerStyle={{ paddingRight: 24 }}
            renderItem={({ item, index }) => (
              <View style={[styles.speciesCard, { width: CARD_WIDTH }]}>
                <View style={styles.speciesCardHeader}>
                  <Image source={{ uri: getSpeciesImage(index) }} style={styles.speciesAvatarImage} />
                  <View style={styles.speciesCardHeaderText}>
                    <Text style={styles.speciesName}>{item.name}</Text>
                    <Text style={styles.speciesScientific}>{item.speciesName}</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleFavorite(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <IconSymbol
                      name={favorites.has(item.id) ? 'heart.fill' : 'heart'}
                      size={20}
                      color={favorites.has(item.id) ? '#FF4D4D' : '#6E6E73'}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.speciesSummary}>{item.summary}</Text>

                <View style={styles.speciesDataGrid}>
                  <View style={styles.speciesDataRow}>
                    <Text style={styles.speciesDataLabel}>Origin</Text>
                    <Text style={styles.speciesDataValue}>{item.origin}</Text>
                  </View>
                  <View style={styles.speciesDataRow}>
                    <Text style={styles.speciesDataLabel}>Lifespan</Text>
                    <Text style={styles.speciesDataValue}>{item.lifespan}</Text>
                  </View>
                  <View style={styles.speciesDataRow}>
                    <Text style={styles.speciesDataLabel}>Preferred temp</Text>
                    <Text style={styles.speciesDataValue}>{item.preferredTempC}</Text>
                  </View>
                  <View style={styles.speciesDataRow}>
                    <Text style={styles.speciesDataLabel}>Feeding</Text>
                    <Text style={styles.speciesDataValue}>{item.feeding}</Text>
                  </View>
                </View>
              </View>
            )}
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

          {/* Action Button */}
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.9}>
            <Text style={styles.actionButtonText}>View Tank Schedule</Text>
          </TouchableOpacity>

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
  headerRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justify: 'center',
  },
  tankName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Platform',
    letterSpacing: -0.5,
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
  overviewText: {
    color: '#8E8E93',
    fontSize: 15,
    lineHeight: 22,
  },

  // Need to Know Condition Tiles
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justify: 'space-between',
    rowGap: 12,
  },
  conditionTile: {
    width: (SCREEN_WIDTH - 52) / 2,
    height: 140,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 16,
    justify: 'space-between',
  },
  conditionTileLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  conditionIconContainer: {
    alignItems: 'center',
    justify: 'center',
    marginVertical: 4,
  },
  conditionTileValue: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '500',
  },

  // Species Cards
  speciesCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
    marginRight: CARD_GAP,
  },
  speciesCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  speciesAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  speciesCardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  speciesName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  speciesScientific: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
  },
  speciesSummary: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  speciesDataGrid: {
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: 12,
  },
  speciesDataRow: {
    flexDirection: 'row',
    justify: 'space-between',
    marginBottom: 8,
  },
  speciesDataLabel: {
    color: '#6E6E73',
    fontSize: 13,
  },
  speciesDataValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
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

  // Action Button
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justify: 'center',
    marginTop: 32,
  },
  actionButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },

  // Missing screen fallback
  missingContainer: {
    flex: 1,
    backgroundColor: '#121214',
    alignItems: 'center',
    justify: 'center',
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