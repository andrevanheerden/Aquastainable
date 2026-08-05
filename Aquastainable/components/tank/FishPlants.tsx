import React from 'react';
import { FlatList, Text, StyleSheet } from 'react-native';
import SpeciesCard from './SpeciesCard';

type Props = {
  species: any[];
  speciesListRef: any;
  getSpeciesImage: (speciesId: string, index: number) => string;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  cardWidth: number;
  cardStride: number;
  onSpeciesScrollEnd: (e: any) => void;
  onSpeciesPress?: (item: any) => void;
};

export default function FishPlants({ species, speciesListRef, getSpeciesImage, favorites, toggleFavorite, cardWidth, cardStride, onSpeciesScrollEnd, onSpeciesPress }: Props) {
  return (
    <>
      <Text style={localStyles.sectionTitle}>Fish & plants</Text>
      <FlatList
        ref={speciesListRef}
        data={species}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        snapToInterval={cardStride}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onSpeciesScrollEnd}
        contentContainerStyle={{ paddingRight: 24 }}
        renderItem={({ item, index }) => (
          <SpeciesCard
            item={item}
            index={index}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            getSpeciesImage={() => getSpeciesImage(item.id, index)}
            cardWidth={cardWidth}
            onPress={() => onSpeciesPress?.(item)}
          />
        )}
      />
    </>
  );
}

const localStyles = StyleSheet.create({
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
});
