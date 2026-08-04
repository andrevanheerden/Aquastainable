import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import MainFishDisplay from '@/components/fish&Plants/MainFishDisplay';
import SpeciesOverview from '@/components/fish&Plants/SpeciesOverview';
import CareCards from '@/components/fish&Plants/CareCards';
import FishLogGrid from '@/components/fish&Plants/FishLogGrid';
import { getTankDetail } from '@/app/data/tankDetails';

const MAIN_FISH_IMAGE = require('../../assets/fishTank/guppy.jpg');

const defaultCareItems = [
  { label: 'Temp', value: '24-26°C' },
  { label: 'pH range', value: '6.5-7.5' },
  { label: 'Water space', value: '30 L' },
];

export default function FishPlantScreen() {
  const tank = getTankDetail('1');
  const mainSpecies = tank?.species?.[0];
  const careItems = [...defaultCareItems];
  if (mainSpecies) {
    careItems.push({ label: 'Feed type', value: mainSpecies.feeding });
  } else {
    careItems.push({ label: 'Feed type', value: 'Flakes' });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{ marginHorizontal: 0 }}>
          <MainFishDisplay
            image={MAIN_FISH_IMAGE}
            title={mainSpecies?.name ?? 'Guppy'}
            origin={mainSpecies?.origin}
            lifespan={mainSpecies?.lifespan}
          />
        </View>

        <View style={styles.paddedContent}>
          <SpeciesOverview
            title="Species details"
            description="This section helps you keep the main fish and plant in view. Add a name, track the tank conditions, and build a digital school for your aquarium."
          />

          <CareCards cards={careItems} />

          <View style={styles.logSection}>
            <SpeciesOverview
              title="Fish school"
              description="Log each fish in your tank with a name and photo. The last card is a placeholder to add a new fish in the future."
            />
            <FishLogGrid />
          </View>
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
  logSection: {
    marginTop: 24,
  },
});
