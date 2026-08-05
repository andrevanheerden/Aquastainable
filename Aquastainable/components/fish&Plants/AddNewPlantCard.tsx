import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

type Props = {
  onPress?: () => void;
};

export default function AddNewPlantCard({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.plus}>+</Text>
      <Text style={styles.label}>Add new plant</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    minHeight: 170,
    backgroundColor: '#14151B',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  plus: {
    color: '#5B8CFF',
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
});
