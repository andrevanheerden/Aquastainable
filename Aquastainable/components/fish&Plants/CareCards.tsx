import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Card = {
  label: string;
  value: string;
};

type Props = {
  cards: Card[];
};

export default function CareCards({ cards }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Species care</Text>
      <View style={styles.grid}>
        {cards.map((card, index) => (
          <View key={card.label} style={styles.card}>
            <Text style={styles.cardLabel}>{card.label}</Text>
            <Text style={styles.cardValue}>{card.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#14151B',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardLabel: {
    color: '#8F97A6',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  cardValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
