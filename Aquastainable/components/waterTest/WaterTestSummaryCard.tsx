import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

type Props = {
  title: string;
  date: string;
  summary: string;
  data: Array<{ label: string; value: string }>;
  style?: StyleProp<ViewStyle>;
};

export default function WaterTestSummaryCard({ title, date, summary, data, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <Text style={styles.summary}>{summary}</Text>
      <View style={styles.dataSection}>
        {data.map((item) => (
          <View key={item.label} style={styles.dataRow}>
            <Text style={styles.dataLabel}>{item.label}</Text>
            <Text style={styles.dataValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 18,
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    color: '#8F97A6',
    fontSize: 12,
  },
  summary: {
    color: '#8F97A6',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  dataSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dataLabel: {
    color: '#6E6E73',
    fontSize: 12,
  },
  dataValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
