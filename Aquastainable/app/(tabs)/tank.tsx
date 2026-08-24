// app/(tabs)/tank.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Alert,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';

import HeaderRow from '@/components/tank/HeaderRow';
import OverviewSection from '@/components/tank/OverviewSection';
import NeedToKnow from '@/components/tank/NeedToKnow';
import FishPlants from '@/components/tank/FishPlants';
import WaterTestCard from '@/components/tank/WaterTestCard';
import Colors from '../colors';
import { Species, TankDetail } from '../data/tankDetails';
import { useTankApi } from '../hooks/useTankApi';
import { useFishApi } from '../hooks/useFishApi';
import { usePlantApi } from '../hooks/usePlantApi';
import useWaterTestApi, { WaterTestRecord } from '../hooks/useWaterTestApi';
import { auth } from '@/firebase';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 16;
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_STRIDE = CARD_WIDTH + CARD_GAP;
const TILE_GAP = 16;
const TILE_WIDTH = (SCREEN_WIDTH - 40 - TILE_GAP) / 2;
const TILE_HEIGHT = 250;

function mapApiSpecies(item: any, type: Species['type']): Species {
  return {
    id: type === 'fish' ? item.fishId || item.id : item.plantId || item.id,
    type,
    image: item.image || item.imageUrl || '',
    name: item.name || item.FBname || 'Unnamed species',
    speciesName: item.scientificName || item.speciesName || 'Unknown species',
    origin: item.origin || 'Unknown',
    lifespan: item.lifespan || 'Unknown',
    preferredTempC: item.preferredTempC || item.bestTempC || item.tempC || 'Unknown',
    feeding: item.feeding || item.feedType || 'Unknown',
    schoolSize: item.schoolSize || 'Unknown',
    summary: item.summary || item.description || 'No species description available.',
  };
}

// ConditionTile and SpeciesCard moved to components/tank/

export default function TankInfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getTankById, getTankOverview, updateTank } = useTankApi();
  const { getTankFish } = useFishApi();
  const { getUserPlants } = usePlantApi();
  const { getTankWaterTests } = useWaterTestApi();
  
  const [tank, setTank] = useState<TankDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editVisible, setEditVisible] = useState(false);
  const [editForm, setEditForm] = useState({ tankName: '', tankSize: '', tankImg: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const speciesListRef = useRef<FlatList<Species>>(null);

  // Get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user?.uid ?? null);
    });
    return () => unsubscribe();
  }, []);

  // Fetch tank data from the API.
  useEffect(() => {
    const loadTank = async () => {
      setLoading(true);
      
      if (!id) {
        setLoading(false);
        return;
      }

      if (currentUserId) {
        try {
          const [apiTank, tankFish, userPlants, waterTests] = await Promise.all([
            getTankById(currentUserId, id),
            getTankFish(id).catch(() => []),
            getUserPlants(currentUserId).catch(() => []),
            getTankWaterTests(id).catch(() => []),
          ]);
          if (apiTank) {
              const latestTest = [...waterTests].sort((left, right) => new Date(right.testedAt).getTime() - new Date(left.testedAt).getTime())[0] as WaterTestRecord | undefined;
              const species = [
                ...tankFish.map((fish) => mapApiSpecies(fish, 'fish')),
                ...userPlants.filter((plant) => plant.tankId === id).map((plant) => mapApiSpecies(plant, 'plant')),
              ];
              let overview = apiTank.overview || '';
              try {
                const overviewResult = await getTankOverview(currentUserId, id);
                overview = overviewResult.overview || overview;
              } catch (overviewError) {
                console.error('Error generating tank overview:', overviewError);
              }

            // Convert API tank format to TankDetail format
            const convertedTank: TankDetail = {
              tankId: apiTank.tankId || apiTank.id,
              tankName: apiTank.tankName,
              tankSize: apiTank.tankSize,
              tankImg: apiTank.tankImg,
                overviewSummary: overview,
              conditions: {
                preferredTempC: latestTest?.readings?.temperatureC || apiTank.preferredTempC || apiTank.temperatureC || '',
                waterQuality: (latestTest?.waterQuality || apiTank.waterQuality || 'Good') as TankDetail['conditions']['waterQuality'],
                lastTestedDaysAgo: latestTest ? Math.max(0, Math.floor((Date.now() - new Date(latestTest.testedAt).getTime()) / 86400000)) : apiTank.lastTestedDaysAgo || 0,
                ph: latestTest?.readings?.ph || apiTank.ph || '',
                ammoniaPpm: (latestTest?.readings?.ammoniaPpm ?? apiTank.ammoniaPpm?.toString()) || '',
                nitritePpm: (latestTest?.readings?.nitritePpm ?? apiTank.nitritePpm?.toString()) || '',
              },
              species,
              careTips: [],
            };
            setTank(convertedTank);
          }
        } catch (error) {
          console.error('Error fetching tank:', error);
        }
      }
      
      setLoading(false);
    };

    loadTank();
  }, [id, currentUserId, getTankById, getTankOverview]);

  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set((tank?.species ?? []).filter((s) => s.favorite).map((s) => s.id))
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.missingContainer}>
        <Text style={styles.missingText}>Loading tank...</Text>
      </SafeAreaView>
    );
  }

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
  const tankImageSource = tank.tankImg ? { uri: tank.tankImg } : null;

  const openEditModal = () => {
    setEditForm({ tankName: tank.tankName, tankSize: String(tank.tankSize || ''), tankImg: tank.tankImg || '' });
    setEditVisible(true);
  };

  const pickTankImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setEditForm((current) => ({ ...current, tankImg: asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri }));
    }
  };

  const saveTankEdits = async () => {
    if (!currentUserId || !tank) return;
    const tankName = editForm.tankName.trim();
    const tankSize = Number(editForm.tankSize);
    if (!tankName || !Number.isFinite(tankSize) || tankSize <= 0) {
      Alert.alert('Missing details', 'Enter a tank name and a size greater than zero.');
      return;
    }

    setSavingEdit(true);
    try {
      const updatedTank = await updateTank(currentUserId, tank.tankId, { tankName, tankSize, tankImg: editForm.tankImg });
      setTank((current) => current ? { ...current, tankName: updatedTank.tankName, tankSize: updatedTank.tankSize, tankImg: updatedTank.tankImg } : current);
      setEditVisible(false);
    } catch (error) {
      Alert.alert('Tank update failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121214" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <HeaderRow onBack={() => router.back()} onMenu={openEditModal} />

          {/* Title + Subtitle */}
          <Text style={styles.tankName}>{tank.tankName}</Text>
          <Text style={styles.tankSubtitle}>Fresh water</Text>

          {/* Hero Image Section */}
          <View style={styles.hero}>
            <View style={styles.heroSideColumn}>
              <View style={styles.heroThumbStack}>
                {tank.species.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.heroSmallThumb,
                      index !== 0 && styles.heroSmallThumbSpacing,
                    ]}
                  >
                    {item.image ? <Image source={{ uri: item.image }} style={styles.heroSmallThumbImage} resizeMode="cover" /> : null}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.heroPreviewContainer}>
              <View style={styles.heroPreviewBackground}>
                {tankImageSource ? <Image source={tankImageSource} style={styles.heroPreviewBackgroundImage} blurRadius={24} /> : null}
                <View style={styles.heroPreviewOverlay} />
              </View>
              <View style={styles.heroCircleContainer}>
                <View style={styles.heroCircleGlow} />
                {tankImageSource ? <Image source={tankImageSource} style={styles.heroCircleImage} resizeMode="cover" /> : null}
              </View>
            </View>
          </View>

          <OverviewSection overview={tank.overviewSummary} />

          <NeedToKnow conditions={tank.conditions} tankSize={tank.tankSize} />

          <WaterTestCard
            conditions={tank.conditions}
            onPress={() => router.push({ pathname: '/(tabs)/waterTestDetails', params: { tankId: tank.tankId } })}
          />

          <FishPlants
            species={tank.species}
            speciesListRef={speciesListRef}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            cardWidth={CARD_WIDTH}
            cardStride={CARD_STRIDE}
            onSpeciesScrollEnd={onSpeciesScrollEnd}
            onSpeciesPress={(item) => {
              const dest = item.type === 'plant' ? '/(tabs)/plantDetails' : '/(tabs)/fishDetails';
              router.push({ pathname: dest, params: { speciesId: item.id } });
            }}
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
      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.editBackdrop}>
          <View style={styles.editCard}>
            <View style={styles.editHeader}>
              <View>
                <Text style={styles.editEyebrow}>TANK DETAILS</Text>
                <Text style={styles.editTitle}>Edit tank</Text>
              </View>
              <TouchableOpacity style={styles.editClose} onPress={() => setEditVisible(false)} accessibilityLabel="Close edit tank">
                <Text style={styles.editCloseText}>X</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.editImageBox} onPress={pickTankImage} activeOpacity={0.8}>
              {editForm.tankImg ? <Image source={{ uri: editForm.tankImg }} style={styles.editImage} resizeMode="cover" /> : <Text style={styles.editImageText}>Add tank image</Text>}
              <View style={styles.editImageBadge}><Text style={styles.editImageBadgeText}>Change</Text></View>
            </TouchableOpacity>

            <Text style={styles.editLabel}>Tank name</Text>
            <TextInput value={editForm.tankName} onChangeText={(value) => setEditForm((current) => ({ ...current, tankName: value }))} placeholder="Tank name" placeholderTextColor="#6E7684" style={styles.editInput} />
            <Text style={styles.editLabel}>Tank size (litres)</Text>
            <TextInput value={editForm.tankSize} onChangeText={(value) => setEditForm((current) => ({ ...current, tankSize: value }))} placeholder="20" placeholderTextColor="#6E7684" keyboardType="numeric" style={styles.editInput} />

            <TouchableOpacity style={styles.saveEditButton} onPress={saveTankEdits} disabled={savingEdit} activeOpacity={0.8}>
              <Text style={styles.saveEditText}>{savingEdit ? 'Saving...' : 'Save changes'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
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
    justifyContent: 'center',
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

  editBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 18,
    backgroundColor: 'rgba(7,12,21,0.78)',
  },
  editCard: {
    maxHeight: '90%',
    padding: 22,
    borderRadius: 24,
    backgroundColor: '#16151A',
    borderWidth: 1,
    borderColor: 'rgba(168,196,203,0.18)',
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  editEyebrow: {
    color: '#6C98A0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  editTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  editClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  editCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  editImageBox: {
    height: 150,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    overflow: 'hidden',
    backgroundColor: '#1B1D26',
  },
  editImage: {
    width: '100%',
    height: '100%',
  },
  editImageText: {
    color: '#A8C4CB',
    fontSize: 14,
    fontWeight: '600',
  },
  editImageBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  editImageBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  editLabel: {
    color: '#A8C4CB',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
  },
  editInput: {
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: '#1B1D26',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  saveEditButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
    borderRadius: 15,
    backgroundColor: '#2E8CA6',
  },
  saveEditText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
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
