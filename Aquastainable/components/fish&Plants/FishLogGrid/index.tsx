import React from 'react';
import { View, StyleSheet } from 'react-native';

import FishLogCard from '../FishLogCard';
import AddNewFishCard from '../AddNewFishCard';

const LOG_ITEMS = [
  {
    id: 'log1',
    name: 'Sunny Guppy',
    image: require('../../../assets/fishTank/guppy.jpg'),
  },
  {
    id: 'log2',
    name: 'Goldie',
    image: require('../../../assets/fishTank/goldFish.jpg'),
  },
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
