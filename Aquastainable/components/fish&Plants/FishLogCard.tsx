import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type Props = {
  image: number | { uri: string };
  name: string;
  age: string;
  health: string;
};

export default function FishLogCard({ image, name, age, health }: Props) {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.image} resizeMode="cover" />
      <View style={styles.body}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.label}>Age</Text>
          <Text style={styles.value}>{age}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Health</Text>
          <Text style={styles.value}>{health}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#14151B',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 0,
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
});
