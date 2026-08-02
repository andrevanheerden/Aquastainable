// app/tank/[id].tsx
// Tank info screen — reached by tapping "Tank info" on the dashboard.
//
// Layout, top to bottom:
//   - hero: stacked species thumbnails on the left, big preview on the right
//     (tapping a thumbnail updates the preview AND scrolls the Fish & Plants
//     carousel below to match)
//   - Overview, in its own card
//   - Tank conditions, in its own card
//   - Fish & plants — one species card visible at a time, swipe to move
//     through them, with dot indicators showing how many there are
//   - Care tips

import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
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

// Simple colored-circle placeholders standing in for real species photos —
// swap these for <Image source={require(...)} /> once you have photos per
// species, keyed by species.id.
const SPECIES_PLACEHOLDER_COLORS = [Colors.teal, Colors.orange, Colors.primary, Colors.info];

function speciesColor(species: Species) {
  const idx = species.id.charCodeAt(species.id.length - 1) % SPECIES_PLACEHOLDER_COLORS.length;
  return SPECIES_PLACEHOLDER_COLORS[idx];
}

function ConditionCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={styles.conditionCard}>
      <Text style={styles.conditionLabel}>{label}</Text>
      <Text style={[styles.conditionValue, accent ? { color: accent } : null]}>{value}</Text>
    </View>
  );
}

function waterQualityColor(quality: string) {
  switch (quality) {
    case 'Excellent':
    case 'Good':
      return Colors.success;
    case 'Fair':
      return Colors.warning;
    default:
      return Colors.error;
  }
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

  const activeSpecies = tank.species[activeIndex];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <IconSymbol name="chevron.left" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.tankName}>Tank name</Text>
          <Text style={styles.tankSubtitle}>{tank.species.length} species in this tank</Text>

          {/* hero: thumbnail stack on the left, big preview on the right */}
          <View style={styles.hero}>
            <View style={styles.heroThumbColumn}>
              {tank.species.map((s, i) => {
                const selected = i === activeIndex;
                return (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => goToIndex(i)}
                    activeOpacity={0.85}
                    style={[
                      styles.heroThumb,
                      { backgroundColor: speciesColor(s) },
                      selected && styles.heroThumbSelected,
                    ]}
                  >
                    {selected && <View style={styles.heroThumbTab} />}
                    <Text style={styles.heroThumbEmoji}>{s.type === 'plant' ? '🌿' : '🐟'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.heroPreview, { backgroundColor: speciesColor(activeSpecies) }]}>
              <Text style={styles.heroPreviewEmoji}>{activeSpecies.type === 'plant' ? '🌿' : '🐟'}</Text>
              <View style={styles.heroPreviewLabel}>
                <Text style={styles.heroPreviewName}>{activeSpecies.name}</Text>
                <Text style={styles.heroPreviewScientific}>{activeSpecies.speciesName}</Text>
              </View>
            </View>
          </View>

          {/* overview */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.card}>
            <Text style={styles.overviewText}>{tank.overviewSummary}</Text>
          </View>

          {/* tank conditions */}
          <Text style={styles.sectionTitle}>Tank conditions</Text>
          <View style={[styles.card, styles.conditionsCard]}>
            <View style={styles.conditionsGrid}>
              <ConditionCard label="PREFERRED TEMP" value={tank.conditions.preferredTempC} />
              <ConditionCard
                label="WATER QUALITY"
                value={tank.conditions.waterQuality}
                accent={waterQualityColor(tank.conditions.waterQuality)}
              />
              <ConditionCard label="PH" value={tank.conditions.ph} />
              <ConditionCard label="AMMONIA" value={tank.conditions.ammoniaPpm} />
              <ConditionCard label="NITRITE" value={tank.conditions.nitritePpm} />
              <ConditionCard
                label="LAST TESTED"
                value={tank.conditions.lastTestedDaysAgo === 0 ? 'Today' : `${tank.conditions.lastTestedDaysAgo}d ago`}
              />
            </View>
          </View>

          {/* fish & plants — one card visible at a time */}
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
            renderItem={({ item }) => (
              <View style={[styles.speciesCard, { width: CARD_WIDTH }]}>
                <View style={styles.speciesCardHeader}>
                  <View style={[styles.speciesAvatar, { backgroundColor: speciesColor(item) }]}>
                    <Text style={styles.speciesAvatarEmoji}>{item.type === 'plant' ? '🌿' : '🐟'}</Text>
                  </View>
                  <View style={styles.speciesCardHeaderText}>
                    <Text style={styles.speciesName}>{item.name}</Text>
                    <Text style={styles.speciesScientific}>{item.speciesName}</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleFavorite(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <IconSymbol
                      name={favorites.has(item.id) ? 'heart.fill' : 'heart'}
                      size={22}
                      color={favorites.has(item.id) ? Colors.primary : Colors.gray}
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
                  <View style={styles.speciesDataRow}>
                    <Text style={styles.speciesDataLabel}>School size</Text>
                    <Text style={styles.speciesDataValue}>{item.schoolSize}</Text>
                  </View>
                </View>
              </View>
            )}
          />

          {/* dot indicators — makes it clear there's more than one card */}
          {tank.species.length > 1 && (
            <View style={styles.dotsRow}>
              {tank.species.map((s, i) => (
                <TouchableOpacity key={s.id} onPress={() => goToIndex(i)} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
                  <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* care tips */}
          <Text style={styles.sectionTitle}>Care tips</Text>
          <View style={styles.card}>
            {tank.careTips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const HERO_HEIGHT = 220;
const THUMB_SIZE = 64;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tankName: {
    color: Colors.white,
    fontSize: 30,
    fontWeight: '700',
  },
  tankSubtitle: {
    color: Colors.lightBlue,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 18,
  },

  // hero
  hero: {
    flexDirection: 'row',
    height: HERO_HEIGHT,
    marginBottom: 8,
  },
  heroThumbColumn: {
    justifyContent: 'space-between',
    marginRight: 14,
    zIndex: 2,
  },
  heroThumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.55,
  },
  heroThumbSelected: {
    opacity: 1,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  heroThumbTab: {
    position: 'absolute',
    left: -8,
    top: '50%',
    marginTop: -10,
    width: 8,
    height: 20,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    backgroundColor: Colors.white,
  },
  heroThumbEmoji: {
    fontSize: 26,
  },
  heroPreview: {
    flex: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroPreviewEmoji: {
    fontSize: 72,
  },
  heroPreviewLabel: {
    position: 'absolute',
    left: 16,
    bottom: 14,
  },
  heroPreviewName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  heroPreviewScientific: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontStyle: 'italic',
  },

  sectionTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  overviewText: {
    color: Colors.lightBlue,
    fontSize: 14,
    lineHeight: 21,
  },
  conditionsCard: {
    paddingBottom: 6,
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  conditionCard: {
    width: '33.33%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  conditionLabel: {
    color: Colors.gray,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  conditionValue: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },

  speciesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginRight: CARD_GAP,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  speciesCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  speciesAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speciesAvatarEmoji: {
    fontSize: 22,
  },
  speciesCardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  speciesName: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  speciesScientific: {
    color: Colors.gray,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  speciesSummary: {
    color: Colors.lightBlue,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  speciesDataGrid: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 12,
  },
  speciesDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  speciesDataLabel: {
    color: Colors.gray,
    fontSize: 12,
  },
  speciesDataValue: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 12,
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: Colors.orange,
    width: 18,
  },

  tipRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.orange,
    marginTop: 6,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    color: Colors.lightBlue,
    fontSize: 13,
    lineHeight: 20,
  },
  missingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingText: {
    color: Colors.white,
    fontSize: 16,
    marginBottom: 12,
  },
  backLinkButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backLinkText: {
    color: Colors.lightBlue,
    fontSize: 14,
  },
});