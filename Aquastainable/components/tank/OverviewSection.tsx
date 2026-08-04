import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  overview: string;
};

export default function OverviewSection({ overview }: Props) {
  return (
    <>
      <Text style={localStyles.sectionTitle}>Overview</Text>
      <Text style={localStyles.overviewText}>{overview}</Text>
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
  overviewText: {
    color: '#8E8E93',
    fontSize: 17,
    lineHeight: 22,
  },
});
