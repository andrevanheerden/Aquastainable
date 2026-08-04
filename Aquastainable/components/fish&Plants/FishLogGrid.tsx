import React from 'react';
import { View, StyleSheet } from 'react-native';

import FishLogCard from './FishLogCard';
import AddNewFishCard from './AddNewFishCard';

// Guppy school: 6 individual fish using the guppy asset files.
const LOG_ITEMS = [
  { id: 'g1', name: 'Jade | 1.5 yrs', image: require('../../assets/guppy/guppy-Jade.jpeg') },
  { id: 'g2', name: 'Midas | 1.2 yrs', image: require('../../assets/guppy/guppy-Midas.jpeg') },
  { id: 'g3', name: 'Pixel | 1.0 yrs', image: require('../../assets/guppy/guppy-Pixel.jpeg') },
  { id: 'g4', name: 'Tux | 2.0 yrs', image: require('../../assets/guppy/guppy-Tux.jpeg') },
  { id: 'g5', name: 'Ziggy | 0.8 yrs', image: require('../../assets/guppy/guppy-Ziggy.jpg') },
  { id: 'g6', name: 'Zues | 1.7 yrs', image: require('../../assets/guppy/guppy-Zues.jpeg') },
];

export default function FishLogGrid() {
  return (
    <View style={styles.grid}>
      {LOG_ITEMS.map((fish) => (
        <FishLogCard key={fish.id} name={fish.name} image={fish.image} />
      ))}
      <AddNewFishCard />
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
