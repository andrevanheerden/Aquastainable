import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '@/firebase';
import AddNewFishCard from '@/components/fish&Plants/AddNewFishCard';
import AddFishModal from '@/components/fish&Plants/AddFishModal';
import HoldActionButton from '@/components/fish&Plants/HoldActionButton';
import { TankFish, useFishApi } from '@/app/hooks/useFishApi';

type SpeciesCardItem = TankFish;

export default function FishSpeciesScreen() {
  const router = useRouter();
  const { getUserFish, updateFish, removeFishFromTank, loading, error } = useFishApi();
  const [addFishVisible, setAddFishVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [species, setSpecies] = useState<SpeciesCardItem[]>([]);
  const [editingFish, setEditingFish] = useState<SpeciesCardItem | null>(null);
  const [schoolSizeDraft, setSchoolSizeDraft] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUserId(user?.uid ?? null));
    return unsubscribe;
  }, []);

  const loadFish = useCallback(() => {
    if (!currentUserId) {
      setSpecies([]);
      return;
    }

    getUserFish(currentUserId)
      .then((fish) => setSpecies(Array.isArray(fish) ? fish : []))
      .catch(() => setSpecies([]));
  }, [currentUserId, getUserFish]);

  useFocusEffect(useCallback(() => {
    loadFish();
  }, [loadFish]));

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

  const openFishEditor = (item: SpeciesCardItem) => {
    setEditingFish(item);
    setSchoolSizeDraft(item.schoolSize || '');
  };

  const saveFishEdit = async () => {
    if (!currentUserId || !editingFish || !schoolSizeDraft.trim()) return;
    setActionLoading(true);
    try {
      await updateFish(currentUserId, editingFish.tankId, editingFish.id, schoolSizeDraft.trim());
      setEditingFish(null);
      loadFish();
    } catch (saveError) {
      Alert.alert('Fish update failed', saveError instanceof Error ? saveError.message : 'Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteFish = async (item: SpeciesCardItem) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await removeFishFromTank(currentUserId || '', item.tankId, item.id);
      setSpecies((current) => current.filter((fish) => fish.id !== item.id || fish.tankId !== item.tankId));
    } catch (deleteError) {
      Alert.alert('Fish deletion failed', deleteError instanceof Error ? deleteError.message : 'Please try again.');
    } finally {
      setActionLoading(false);
    }
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
            <View style={styles.card}>
              <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.9}>
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
              <View style={styles.actionRow}>
                <HoldActionButton label="Hold to edit" onHold={() => openFishEditor(item)} fillColor="#2E8CA6" />
                <HoldActionButton label="Hold to delete" onHold={() => { void deleteFish(item); }} fillColor="#B83A45" style={styles.deleteAction} />
              </View>
            </View>
          );
        }}
      />
      {loading ? <ActivityIndicator color="#FFFFFF" style={styles.loading} /> : null}
      {!loading && !error && species.length === 0 ? <Text style={styles.emptyState}>No fish have been added to your tanks yet.</Text> : null}
      {error ? <Text style={styles.emptyState}>Unable to load your fish right now.</Text> : null}
      <AddFishModal visible={addFishVisible} onClose={() => { setAddFishVisible(false); loadFish(); }} />
      <Modal visible={Boolean(editingFish)} transparent animationType="fade" onRequestClose={() => setEditingFish(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.editModal}>
            <Text style={styles.editTitle}>Edit school size</Text>
            <Text style={styles.editSubtitle}>{editingFish?.name || 'Fish'}</Text>
            <TextInput value={schoolSizeDraft} onChangeText={setSchoolSizeDraft} keyboardType="numeric" placeholder="School size" placeholderTextColor="#6E7684" style={styles.editInput} />
            <HoldActionButton label={actionLoading ? 'Saving...' : 'Hold to save'} onHold={() => { void saveFishEdit(); }} fillColor="#2E8CA6" />
            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingFish(null)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  actionRow: { gap: 8, padding: 10 },
  deleteAction: { backgroundColor: '#6F2028' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', padding: 24 },
  editModal: { backgroundColor: '#14151B', borderRadius: 18, padding: 20 },
  editTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  editSubtitle: { color: '#8F97A6', marginTop: 4, marginBottom: 16 },
  editInput: { color: '#FFFFFF', backgroundColor: '#20232C', borderRadius: 10, padding: 12, marginBottom: 12 },
  cancelButton: { alignItems: 'center', padding: 12, marginTop: 8 },
  cancelText: { color: '#A8C4CB', fontWeight: '700' },
});
