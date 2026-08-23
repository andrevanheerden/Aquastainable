import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import FishLogCard from './FishLogCard';
import AddNewFishCard from './AddNewFishCard';
import AddSchoolFishModal, { FishRecord } from './AddSchoolFishModal';

// Guppy school: 6 individual fish using the guppy asset files.
const LOG_ITEMS: FishRecord[] = [
  { id: 'g1', name: 'Jade', age: '1.5 yrs', health: 'Thriving', description: 'Jade is the calm center of the school and is usually the first to explore a new hiding spot.', schoolStatus: 'existing', image: require('../../assets/guppy/guppy-Jade.jpeg') },
  { id: 'g2', name: 'Midas', age: '1.2 yrs', health: 'Healthy', description: 'Midas is an energetic swimmer who loves feeding time and keeps the school moving.', schoolStatus: 'existing', image: require('../../assets/guppy/guppy-Midas.jpeg') },
  { id: 'g3', name: 'Pixel', age: '1.0 yrs', health: 'Excellent', description: 'Pixel is curious and quick, often darting between the plants at the front of the tank.', schoolStatus: 'existing', image: require('../../assets/guppy/guppy-Pixel.jpeg') },
  { id: 'g4', name: 'Tux', age: '2.0 yrs', health: 'Stable', description: 'Tux is the oldest fish in the school and has a steady, confident presence.', schoolStatus: 'existing', image: require('../../assets/guppy/guppy-Tux.jpeg') },
  { id: 'g5', name: 'Ziggy', age: '0.8 yrs', health: 'Active', description: 'Ziggy is the newest member of the school and has quickly settled into the group.', schoolStatus: 'existing', image: require('../../assets/guppy/guppy-Ziggy.jpg') },
  { id: 'g6', name: 'Zues', age: '1.7 yrs', health: 'Strong', description: 'Zues is a strong swimmer who often leads the school across the open water.', schoolStatus: 'existing', image: require('../../assets/guppy/guppy-Zues.jpeg') },
];

export default function FishLogGrid() {
  const [fishRecords, setFishRecords] = useState<FishRecord[]>(LOG_ITEMS);
  const [isAddFishVisible, setIsAddFishVisible] = useState(false);

  return (
    <View style={styles.grid}>
      {fishRecords.map((fish) => (
        <FishLogCard key={fish.id} name={fish.name} age={fish.age} health={fish.health} description={fish.description} image={fish.image} />
      ))}
      <AddNewFishCard onPress={() => setIsAddFishVisible(true)} />
      <AddSchoolFishModal
        visible={isAddFishVisible}
        onClose={() => setIsAddFishVisible(false)}
        onSave={(fish) => setFishRecords((currentFish) => [...currentFish, fish])}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});
