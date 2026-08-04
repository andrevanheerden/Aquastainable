import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import WaterTestTankSelector from '../../components/waterTest/WaterTestTankSelector';

const TANK_IMAGES = {
  '1': require('../../assets/fishTank/FishTankForest.jpeg'),
  '2': require('../../assets/fishTank/FishTankLiveingRoom.jpeg'),
  '3': require('../../assets/fishTank/FishTankTree.jpeg'),
};

const TANKS = [
  { id: '1', name: 'Amazonian Reef Tank', image: TANK_IMAGES['1'], testDate: '2 days ago', waterQuality: 'Excellent' },
  { id: '2', name: 'Nano Betta Sanctuary', image: TANK_IMAGES['2'], testDate: '4 days ago', waterQuality: 'Stable' },
  { id: '3', name: 'Treehouse Aquascape', image: TANK_IMAGES['3'], testDate: '6 days ago', waterQuality: 'Needs care' },
];

export default function WaterTestScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Water Test</Text>
          <Text style={styles.subtitle}>Choose a tank to view its latest water test insights.</Text>
        </View>
        <WaterTestTankSelector
          tanks={TANKS}
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
});
