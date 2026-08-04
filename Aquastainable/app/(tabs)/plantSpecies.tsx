import React from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getTankDetail, Species } from '@/app/data/tankDetails';
import AddNewFishCard from '@/components/fish&Plants/AddNewFishCard';

const SPECIES_IMAGES: Record<string, string | number> = {
  f3: require('../../assets/fishTank/duckweed.jpeg'),
  f5: require('../../assets/fishTank/duckweed.jpeg'),
  f7: require('../../assets/fishTank/duckweed.jpeg'),
};

type SpeciesCardItem = Species & { tankName: string };

export default function PlantSpeciesScreen() {
  const router = useRouter();
  const tankIds = ['1', '2', '3'];
  const species: SpeciesCardItem[] = tankIds.flatMap((tankId) => {
    const tankDetail = getTankDetail(tankId);
    return (tankDetail?.species ?? [])
      .filter((item) => item.type === 'plant')
      .map((item) => ({ ...item, tankName: tankDetail?.tankName ?? 'Unknown Tank' }));
  });

  const handlePress = (item: SpeciesCardItem) => {
    router.push({ pathname: '/(tabs)/plantDetails', params: { speciesId: item.id } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plant Species</Text>
        <Text style={styles.subtitle}>Browse the plants currently in your tanks.</Text>
      </View>

      <FlatList
        data={[...species, { id: 'add-plant-card', type: 'plant', name: '', speciesName: '', origin: '', lifespan: '', preferredTempC: '', feeding: '', schoolSize: '', summary: '', tankName: '' } as SpeciesCardItem]}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          if (item.id === 'add-plant-card') {
            return <AddNewFishCard />;
          }

          const imageSource = SPECIES_IMAGES[item.id] ?? require('../../assets/fishTank/duckweed.jpeg');
          return (
            <TouchableOpacity style={styles.card} onPress={() => handlePress(item)} activeOpacity={0.9}>
              <Image source={imageSource} style={styles.image} resizeMode="cover" />
              <View style={styles.cardBody}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.scientific}>{item.speciesName}</Text>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Tank</Text>
                  <Text style={[styles.value, styles.compactValue]} numberOfLines={1}>
                    {item.tankName.length > 10 ? `${item.tankName.slice(0, 10)}...` : item.tankName}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0F',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#8F97A6',
    fontSize: 14,
    marginTop: 6,
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 32,
    paddingTop: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#14151B',
    borderRadius: 22,
    overflow: 'hidden',
    marginTop: 8,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    width: '46%',
  },
  image: {
    width: '100%',
    height: 150,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  scientific: {
    color: '#8F97A6',
    fontSize: 13,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 10,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: '#8F97A6',
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  compactValue: {
    maxWidth: 90,
    textAlign: 'right',
  },
});
