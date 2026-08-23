import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';

import MainFishDisplay from '@/components/fish&Plants/MainFishDisplay';
import SpeciesOverview from '@/components/fish&Plants/SpeciesOverview';
import CareCards from '@/components/fish&Plants/CareCards';
import { auth } from '@/firebase';
import { SavedPlant, usePlantApi } from '@/app/hooks/usePlantApi';

const MAIN_PLANT_IMAGE = require('../../assets/fishTank/duckweed.jpeg');

export default function PlantDetailsScreen() {
  const { speciesId } = useLocalSearchParams<{ speciesId?: string }>();
  const { getUserPlants } = usePlantApi();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [plants, setPlants] = useState<SavedPlant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, (user) => setCurrentUserId(user?.uid ?? null)), []);

  useEffect(() => {
    if (!currentUserId) {
      setPlants([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getUserPlants(currentUserId)
      .then((savedPlants) => setPlants(Array.isArray(savedPlants) ? savedPlants : []))
      .catch(() => setPlants([]))
      .finally(() => setLoading(false));
  }, [currentUserId, getUserPlants]);

  const mainPlant = plants.find((plant) => plant.id === speciesId);
  const careItems = mainPlant ? [
    { label: 'Light', value: mainPlant.light || 'Not available' },
    { label: 'Growth', value: mainPlant.growthRate || 'Not available' },
    { label: 'Placement', value: mainPlant.placement || 'Not available' },
    { label: 'pH range', value: mainPlant.phRange || 'Not available' },
  ] : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{ marginHorizontal: 0 }}>
          <MainFishDisplay
            image={mainPlant?.image ? { uri: mainPlant.image } : MAIN_PLANT_IMAGE}
            title={mainPlant?.name ?? 'Plant'}
            preferredTempC={mainPlant?.bestTempC}
            tankName={mainPlant?.tankName}
            phLevel={mainPlant?.phRange}
            feeding={mainPlant?.light ? `Light: ${mainPlant.light}` : undefined}
          />
        </View>

        <View style={styles.paddedContent}>
            <SpeciesOverview title="Species details" description={mainPlant?.description || (loading ? 'Loading plant information.' : 'Plant data is unavailable.')} />

          {loading ? <ActivityIndicator color="#FFFFFF" /> : null}
          {careItems.length ? <CareCards cards={careItems} /> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0F',
  },
  content: {
    paddingBottom: 40,
  },
  paddedContent: {
    paddingHorizontal: 20,
  },
});
