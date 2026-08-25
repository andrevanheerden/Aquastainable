import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

type Props = {
  item: any;
  index: number;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  cardWidth: number;
  onPress?: () => void;
};

export default function SpeciesCard({ item, index, favorites, toggleFavorite, cardWidth, onPress }: Props) {
  const feeding = item.feeding || '';
  const displayedFeeding = feeding.length > 25 ? `${feeding.slice(0, 22)}...` : feeding;

  return (
    <TouchableOpacity
      style={[localStyles.speciesCard, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
    >
      <View style={localStyles.speciesCardHeader}>
        {item.image ? <Image source={{ uri: item.image }} style={localStyles.speciesAvatarImage} /> : <View style={localStyles.speciesAvatarEmpty} />}
        <View style={localStyles.speciesCardHeaderText}>
          <Text style={localStyles.speciesName}>{item.name}</Text>
          <Text style={localStyles.speciesScientific}>{item.speciesName}</Text>
        </View>
        <TouchableOpacity onPress={() => toggleFavorite(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <IconSymbol
            name={favorites.has(item.id) ? 'heart.fill' : 'heart'}
            size={20}
            color={favorites.has(item.id) ? '#FF4D4D' : '#6E6E73'}
          />
        </TouchableOpacity>
      </View>

      <Text style={localStyles.speciesSummary}>{item.summary}</Text>

      <View style={localStyles.speciesDataGrid}>
        <View style={localStyles.speciesDataRow}>
          <Text style={localStyles.speciesDataLabel}>Preferred temp</Text>
          <Text style={localStyles.speciesDataValue}>{item.preferredTempC}</Text>
        </View>
        <View style={localStyles.speciesDataRow}>
          <Text style={localStyles.speciesDataLabel}>Feeding</Text>
          <Text style={localStyles.speciesDataValue}>{displayedFeeding}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
  speciesCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
  },
  speciesCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  speciesAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  speciesAvatarEmpty: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#20232C',
  },
  speciesCardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  speciesName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  speciesScientific: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
  },
  speciesSummary: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  speciesDataGrid: {
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: 12,
  },
  speciesDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  speciesDataLabel: {
    color: '#6E6E73',
    fontSize: 13,
  },
  speciesDataValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
});
