import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

type Props = {
  tanks: Array<{ id: string; name: string; image: number | { uri: string } }>;
  onSelect: (tankId: string) => void;
};

export default function WaterTestTankSelector({ tanks, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {tanks.map((tank) => (
        <TouchableOpacity key={tank.id} style={styles.card} onPress={() => onSelect(tank.id)} activeOpacity={0.9}>
          <Image source={tank.image} style={styles.image} resizeMode="cover" />
          <View style={styles.cardBody}>
            <Text style={styles.title}>{tank.name}</Text>
            <Text style={styles.subtitle}>Open water test history</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  card: {
    backgroundColor: '#14151B',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  image: {
    width: '100%',
    height: 140,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#8F97A6',
    fontSize: 13,
    marginTop: 4,
  },
});
