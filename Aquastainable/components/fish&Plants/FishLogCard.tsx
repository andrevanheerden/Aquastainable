import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type Props = {
  image: number | { uri: string };
  name: string;
};

export default function FishLogCard({ image, name }: Props) {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.image} resizeMode="cover" />
      <Text style={styles.name}>{name}</Text>
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
  name: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
});
