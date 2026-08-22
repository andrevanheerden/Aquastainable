import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

type Props = {
  tanks: Array<{
    id: string;
    name: string;
    image: number | { uri: string };
    testDate?: string;
    waterQuality?: string;
  }>;
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
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.label}>Test date</Text>
              <Text style={[styles.value, styles.compactValue]} numberOfLines={1}>
                {tank.testDate || '~'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Water quality</Text>
              <Text style={[styles.value, styles.compactValue]} numberOfLines={1}>
                {tank.waterQuality || '~'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#14151B',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    width: '48%',
    marginBottom: 12,
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
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
});
