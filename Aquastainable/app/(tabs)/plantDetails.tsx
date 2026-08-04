import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import MainFishDisplay from '@/components/fish&Plants/MainFishDisplay';
import SpeciesOverview from '@/components/fish&Plants/SpeciesOverview';
import CareCards from '@/components/fish&Plants/CareCards';
import { getTankDetail } from '@/app/data/tankDetails';

const MAIN_PLANT_IMAGE = require('../../assets/fishTank/duckweed.jpeg');

const defaultCareItems = [
  { label: 'Light', value: 'Medium' },
  { label: 'Water', value: 'Clean, still' },
  { label: 'Growth', value: 'Moderate' },
];

export default function PlantDetailsScreen() {
  const { speciesId } = useLocalSearchParams<{ speciesId?: string }>();
  const tankIds = ['1', '2', '3'];
  const allSpecies = tankIds.flatMap((tankId) => getTankDetail(tankId)?.species ?? []);
  const mainSpecies = allSpecies.find((item) => item.id === speciesId) ?? allSpecies[0];
  const careItems = [...defaultCareItems];

  if (mainSpecies) {
    careItems.push({ label: 'Feed type', value: mainSpecies.feeding });
  } else {
    careItems.push({ label: 'Feed type', value: 'Nutrients' });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{ marginHorizontal: 0 }}>
          <MainFishDisplay
            image={MAIN_PLANT_IMAGE}
            title={mainSpecies?.name ?? 'Duckweed'}
            subtitle={mainSpecies?.summary}
            origin={mainSpecies?.origin}
            lifespan={mainSpecies?.lifespan}
            preferredTempC={mainSpecies?.preferredTempC}
            feeding={mainSpecies?.feeding}
          />
        </View>

        <View style={styles.paddedContent}>
          <SpeciesOverview
            title="Species details"
            description="This section helps you keep the main plant in view. Add a name, track the tank conditions, and monitor growth needs."
          />

          <CareCards cards={careItems} />
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
