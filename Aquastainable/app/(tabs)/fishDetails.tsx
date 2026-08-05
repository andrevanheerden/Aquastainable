import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import MainFishDisplay from '@/components/fish&Plants/MainFishDisplay';
import SpeciesOverview from '@/components/fish&Plants/SpeciesOverview';
import CareCards from '@/components/fish&Plants/CareCards';
import FishLogGrid from '@/components/fish&Plants/FishLogGrid';
import FishSicknessAssistant, { FishSicknessPrefill } from '@/components/fish&Plants/FishSicknessAssistant';
import { getTankDetail, Species } from '@/app/data/tankDetails';

const MAIN_FISH_IMAGE = require('../../assets/fishTank/guppy.jpg');

const defaultCareItems = [
  { label: 'Temp', value: '24-26°C' },
  { label: 'pH range', value: '6.5-7.5' },
  { label: 'Water space', value: '30 L' },
];

export default function FishDetailsScreen() {
  const router = useRouter();
  const { speciesId } = useLocalSearchParams<{ speciesId?: string }>();
  const tankIds = ['1', '2', '3'];
  const allSpecies = tankIds.flatMap((tankId) => getTankDetail(tankId)?.species ?? []);
  const mainSpecies = allSpecies.find((item) => item.id === speciesId) ?? allSpecies[0];
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
            description="This section helps you keep the main fish and plant in view. Add a name, track the tank conditions, and build a digital school for your aquarium."
          />

          <CareCards cards={careItems} />

          <FishSicknessAssistant
            speciesName={mainSpecies?.name ?? 'Guppy'}
            onSendToAI={(prefill: FishSicknessPrefill) => {
              router.push({
                pathname: '/(tabs)/AskAIScreen',
                params: {
                  theme: 'crimson',
                  prefillText: prefill.text,
                  prefillMediaUri: prefill.mediaUri ?? undefined,
                  prefillMediaType: prefill.mediaType ?? undefined,
                },
              });
            }}
          />

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
