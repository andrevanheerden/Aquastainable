import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';

import MainFishDisplay from '@/components/fish&Plants/MainFishDisplay';
import SpeciesOverview from '@/components/fish&Plants/SpeciesOverview';
import CareCards from '@/components/fish&Plants/CareCards';
import FishLogGrid from '@/components/fish&Plants/FishLogGrid';
import FishSicknessAssistant, { FishSicknessPrefill } from '@/components/fish&Plants/FishSicknessAssistant';
import { auth } from '@/firebase';
import { TankFish, useFishApi } from '@/app/hooks/useFishApi';

const MAIN_FISH_IMAGE = require('../../assets/fishTank/guppy.jpg');

const defaultCareItems = [
  { label: 'Temp', value: 'Not available' },
  { label: 'pH range', value: 'Not available' },
  { label: 'Water space', value: 'Not available' },
  { label: 'School size', value: 'Not available' },
];

export default function FishDetailsScreen() {
  const router = useRouter();
  const { speciesId } = useLocalSearchParams<{ speciesId?: string }>();
  const { getUserFish, enrichFish } = useFishApi();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [fish, setFish] = useState<TankFish[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUserId(user?.uid ?? null));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      setFish([]);
      return;
    }

    getUserFish(currentUserId)
      .then(async (userFish) => {
        const nextFish = Array.isArray(userFish) ? userFish : [];
        setFish(nextFish);
        const selectedFish = nextFish.find((item) => item.id === speciesId || item.fishId === speciesId);
        if (selectedFish && (!selectedFish.description || !selectedFish.bestTempC || !selectedFish.phRange)) {
          try {
            await enrichFish(currentUserId, selectedFish.fishId || speciesId || '');
            const refreshedFish = await getUserFish(currentUserId);
            setFish(Array.isArray(refreshedFish) ? refreshedFish : nextFish);
          } catch {
            setFish(nextFish);
          }
        }
      })
      .catch(() => setFish([]));
  }, [currentUserId, speciesId, getUserFish, enrichFish]);

  const mainSpecies = fish.find((item) => item.id === speciesId || item.fishId === speciesId);
  const careItems = [
    { label: 'Temp', value: mainSpecies?.bestTempC || defaultCareItems[0].value },
    { label: 'pH range', value: mainSpecies?.phRange || defaultCareItems[1].value },
    { label: 'Water space', value: mainSpecies?.waterSpace || defaultCareItems[2].value },
    { label: 'School size', value: mainSpecies?.schoolSize || defaultCareItems[3].value },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{ marginHorizontal: 0 }}>
          <MainFishDisplay
            image={mainSpecies?.image || MAIN_FISH_IMAGE}
            title={mainSpecies?.name ?? 'Fish'}
            origin={mainSpecies?.origin}
            lifespan={mainSpecies?.lifespan}
            preferredTempC={mainSpecies?.bestTempC || mainSpecies?.preferredTempC}
            tankName={mainSpecies?.tankName}
            phLevel={mainSpecies?.phRange || mainSpecies?.pH}
            feeding={mainSpecies?.feedType || mainSpecies?.feeding}
          />
        </View>

        <View style={styles.paddedContent}>
          <SpeciesOverview
            title="Species details"
            description={mainSpecies?.description || 'Care information is being loaded for this species.'}
          />

          <CareCards cards={careItems} />

          <FishSicknessAssistant
            speciesName={mainSpecies?.name ?? 'fish'}
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
