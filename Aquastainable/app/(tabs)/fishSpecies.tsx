import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '@/firebase';
import AddNewFishCard from '@/components/fish&Plants/AddNewFishCard';
import AddFishModal from '@/components/fish&Plants/AddFishModal';
import { TankFish, useFishApi } from '@/app/hooks/useFishApi';

type SpeciesCardItem = TankFish;

export default function FishSpeciesScreen() {
  const router = useRouter();
  const { getUserFish, loading, error } = useFishApi();
  const [addFishVisible, setAddFishVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [species, setSpecies] = useState<SpeciesCardItem[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUserId(user?.uid ?? null));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      setSpecies([]);
      return;
    }

    getUserFish(currentUserId)
      .then((fish) => setSpecies(Array.isArray(fish) ? fish : []))
      .catch(() => setSpecies([]));
  }, [currentUserId, getUserFish]);

  const handlePress = (item: SpeciesCardItem) => {
    router.push({ pathname: '/(tabs)/fishDetails', params: { speciesId: item.id, tankId: item.tankId } });
  };

  const formatSchoolSize = (value = '') => {
    const compactValue = value.replace(/[^0-9]/g, '');
    if (!compactValue) {
      return 'N/A';
    }
    return compactValue.length > 10 ? `${compactValue.slice(0, 10)}...` : compactValue;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fish Species</Text>
        <Text style={styles.subtitle}>Browse the fish currently in your tanks.</Text>
      </View>

      <FlatList
        data={[...species, { id: 'add-fish-card' }]}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          if (!('tankId' in item)) {
            return <AddNewFishCard onPress={() => setAddFishVisible(true)} />;
          }

          const imageSource = item.image ? { uri: item.image } : undefined;
          return (
            <TouchableOpacity style={styles.card} onPress={() => handlePress(item)} activeOpacity={0.9}>
              {imageSource ? <Image source={imageSource} style={styles.image} resizeMode="cover" /> : <View style={styles.imageEmpty} />}
              <View style={styles.cardBody}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.scientific}>{item.speciesName}</Text>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Tank</Text>
                  <Text style={[styles.value, styles.compactValue]} numberOfLines={1}>
                    {(item.tankName || 'Unnamed tank').length > 10
                      ? `${(item.tankName || 'Unnamed tank').slice(0, 10)}...`
                      : item.tankName || 'Unnamed tank'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>School size</Text>
                  <Text style={[styles.value, styles.compactValue]} numberOfLines={1}>
                    {formatSchoolSize(item.schoolSize)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      {loading ? <ActivityIndicator color="#FFFFFF" style={styles.loading} /> : null}
      {!loading && !error && species.length === 0 ? <Text style={styles.emptyState}>No fish have been added to your tanks yet.</Text> : null}
      {error ? <Text style={styles.emptyState}>Unable to load your fish right now.</Text> : null}
      <AddFishModal visible={addFishVisible} onClose={() => setAddFishVisible(false)} />
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
  imageEmpty: {
    height: 150,
    backgroundColor: '#20232C',
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
  loading: {
    marginTop: 16,
  },
  emptyState: {
    color: '#8F97A6',
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
});
