import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';

import AddNewPlantCard from '@/components/fish&Plants/AddNewPlantCard';
import AddPlantModal from '@/components/fish&Plants/AddPlantModal';
import HoldActionButton from '@/components/fish&Plants/HoldActionButton';
import { auth } from '@/firebase';
import { SavedPlant, usePlantApi } from '@/app/hooks/usePlantApi';

type SpeciesCardItem = SavedPlant;

export default function PlantSpeciesScreen() {
  const router = useRouter();
  const { getUserPlants, deletePlant, loading, error } = usePlantApi();
  const [addPlantVisible, setAddPlantVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [species, setSpecies] = useState<SpeciesCardItem[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (user) => setCurrentUserId(user?.uid ?? null)), []);

  const loadPlants = useCallback(() => {
    if (!currentUserId) {
      setSpecies([]);
      return;
    }
    getUserPlants(currentUserId)
      .then((plants) => setSpecies(Array.isArray(plants) ? plants : []))
      .catch(() => setSpecies([]));
  }, [currentUserId, getUserPlants]);

  useFocusEffect(useCallback(() => {
    loadPlants();
  }, [loadPlants]));

  const handlePress = (item: SpeciesCardItem) => {
    router.push({ pathname: '/(tabs)/plantDetails', params: { speciesId: item.id } });
  };

  const removePlant = async (item: SpeciesCardItem) => {
    if (actionLoading || !currentUserId) return;
    setActionLoading(true);
    try {
      await deletePlant(currentUserId, item.tankId, item.id);
      setSpecies((current) => current.filter((plant) => plant.id !== item.id || plant.tankId !== item.tankId));
    } catch (deleteError) {
      Alert.alert('Plant deletion failed', deleteError instanceof Error ? deleteError.message : 'Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plant Species</Text>
        <Text style={styles.subtitle}>Browse the plants currently in your tanks.</Text>
      </View>

      <FlatList
        data={[...species, { id: 'add-plant-card' } as SpeciesCardItem]}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          if (item.id === 'add-plant-card') {
            return <AddNewPlantCard onPress={() => setAddPlantVisible(true)} />;
          }

          const imageSource = item.image ? { uri: item.image } : undefined;
          return (
            <View style={styles.card}>
              <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.9}>
              {imageSource ? <Image source={imageSource} style={styles.image} resizeMode="cover" /> : <View style={styles.imageEmpty} />}
              <View style={styles.cardBody}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.scientific}>{item.scientificName}</Text>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Tank</Text>
                  <Text style={[styles.value, styles.compactValue]} numberOfLines={1}>
                    {(item.tankName || 'Unnamed tank').length > 10 ? `${(item.tankName || 'Unnamed tank').slice(0, 10)}...` : item.tankName || 'Unnamed tank'}
                  </Text>
                </View>
              </View>
              </TouchableOpacity>
              <View style={styles.actionRow}>
                <HoldActionButton label="Hold to delete plant" onHold={() => { void removePlant(item); }} fillColor="#B83A45" style={styles.deleteAction} />
              </View>
            </View>
          );
        }}
      />
      {loading ? <ActivityIndicator color="#FFFFFF" style={styles.loading} /> : null}
      {!loading && !error && species.length === 0 ? <Text style={styles.emptyState}>No plants have been added to your tanks yet.</Text> : null}
      {error ? <Text style={styles.emptyState}>Unable to load your plants right now.</Text> : null}
      <AddPlantModal visible={addPlantVisible} onClose={() => { setAddPlantVisible(false); loadPlants(); }} />
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
  actionRow: { padding: 10 },
  deleteAction: { backgroundColor: '#6F2028' },
});
