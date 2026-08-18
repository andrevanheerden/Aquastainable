import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

type Props = {
  conditions?: {
    preferredTempC?: string;
    ph?: string;
    ammoniaPpm?: string;
    nitritePpm?: string;
    lastTestedDaysAgo?: number;
    waterQuality?: string;
  };
  onPress?: () => void;
};

export default function WaterTestCard({ conditions, onPress }: Props) {
  // Check if water test data exists
  const hasWaterTestData = conditions && conditions.lastTestedDaysAgo !== undefined && conditions.ph && conditions.ammoniaPpm !== undefined && conditions.nitritePpm !== undefined;
  
  if (!hasWaterTestData) {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.9 : 1}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Water Test</Text>
        </View>
        <Text style={styles.emptyStateText}>No water test done</Text>
      </TouchableOpacity>
    );
  }

  const nextTestDue = conditions!.lastTestedDaysAgo! >= 7 ? 'Due now' : `${7 - conditions!.lastTestedDaysAgo!} days`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.9 : 1}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Water Test</Text>
        <View style={[styles.statusPill, conditions!.waterQuality === 'Excellent' ? styles.statusExcellent : styles.statusNeedsAttention]}>
          <Text style={styles.statusText}>{conditions!.waterQuality || 'Unknown'}</Text>
        </View>
      </View>

      <Text style={styles.summary}>
        This is your latest water test outcome — parameters are shown below for a quick status check.
      </Text>

      <View style={styles.dataSection}>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>pH</Text>
          <Text style={styles.dataValue}>{conditions!.ph || 'N/A'}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Temp</Text>
          <Text style={styles.dataValue}>{conditions!.preferredTempC || 'N/A'}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Ammonia</Text>
          <Text style={styles.dataValue}>{conditions!.ammoniaPpm || 'N/A'}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Nitrite</Text>
          <Text style={styles.dataValue}>{conditions!.nitritePpm || 'N/A'}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Next test</Text>
          <Text style={styles.dataValue}>{nextTestDue}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#2C2C2E',
  },
  statusExcellent: {
    backgroundColor: '#0F4D2D',
  },
  statusNeedsAttention: {
    backgroundColor: '#5A2A28',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  summary: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  emptyStateText: {
    color: '#8E8E93',
    fontSize: 15,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  dataSection: {
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: 14,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dataLabel: {
    color: '#6E6E73',
    fontSize: 13,
  },
  dataValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
