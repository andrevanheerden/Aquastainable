import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';

import WaterTestTankSelector from '../../components/waterTest/WaterTestTankSelector';
import { auth } from '@/firebase';
import { TankRecord, useTankApi } from '../hooks/useTankApi';

const TANK_IMAGES = {
  '1': require('../../assets/fishTank/FishTankForest.jpeg'),
  '2': require('../../assets/fishTank/FishTankLiveingRoom.jpeg'),
  '3': require('../../assets/fishTank/FishTankTree.jpeg'),
};

export default function WaterTestScreen() {
  const router = useRouter();
  const { getUserTanks } = useTankApi();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [tanks, setTanks] = useState<TankRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUserId(user?.uid ?? null));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      setTanks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getUserTanks(currentUserId)
      .then((userTanks) => setTanks(Array.isArray(userTanks) ? userTanks : []))
      .catch(() => setTanks([]))
      .finally(() => setLoading(false));
  }, [currentUserId, getUserTanks]);

  const selectorTanks = tanks.map((tank) => ({
    id: tank.tankId || tank.id,
    name: tank.tankName || 'Unnamed tank',
    image: tank.tankImg ? { uri: tank.tankImg } : TANK_IMAGES[tank.tankId] ?? TANK_IMAGES['1'],
    testDate: tank.testDate || '~',
    waterQuality: tank.waterQuality || '~',
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Water Test</Text>
          <Text style={styles.subtitle}>Choose a tank to view its latest water test insights.</Text>
        </View>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : null}
        {!loading && selectorTanks.length === 0 ? <Text style={styles.emptyText}>No tanks available for water testing.</Text> : null}
        <WaterTestTankSelector
          tanks={selectorTanks}
          onSelect={(tankId) => router.push({ pathname: '/(tabs)/waterTestDetails', params: { tankId } })}
        />
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
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
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
  emptyText: {
    color: '#8F97A6',
    fontSize: 14,
    marginTop: 12,
  },
});
