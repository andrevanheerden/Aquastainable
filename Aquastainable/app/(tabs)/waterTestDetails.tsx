import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Image, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { getTankDetail } from '@/app/data/tankDetails';
import WaterTestSummaryCard from '../../components/waterTest/WaterTestSummaryCard';

const TANK_IMAGES = {
  '1': require('../../assets/fishTank/FishTankForest.jpeg'),
  '2': require('../../assets/fishTank/FishTankLiveingRoom.jpeg'),
  '3': require('../../assets/fishTank/FishTankTree.jpeg'),
};

export default function WaterTestDetailsScreen() {
  const { tankId } = useLocalSearchParams<{ tankId?: string }>();
  const tank = getTankDetail(tankId ?? '1');

  if (!tank) {
    return null;
  }

  const conditions = tank.conditions;
  const nextTestDue = conditions.lastTestedDaysAgo >= 7 ? 'Due now' : `${7 - conditions.lastTestedDaysAgo} days`;
  const history = [
    {
      title: 'Latest test',
      date: `${conditions.lastTestedDaysAgo} days ago`,
      summary: `AI review: ${conditions.waterQuality === 'Excellent' ? 'Water quality is stable and the tank is in good condition.' : 'The tank needs attention and should be monitored closely.'}`,
      data: [
        { label: 'pH', value: conditions.ph },
        { label: 'Ammonia', value: conditions.ammoniaPpm },
        { label: 'Nitrite', value: conditions.nitritePpm },
        { label: 'Next test', value: nextTestDue },
      ],
    },
    {
      title: 'Previous test',
      date: '8 days ago',
      summary: 'AI review: Parameters stayed consistent with a minor rise in nitrite, so a follow-up test is recommended.',
      data: [
        { label: 'pH', value: '7.0' },
        { label: 'Ammonia', value: '0 ppm' },
        { label: 'Nitrite', value: '0.1 ppm' },
        { label: 'Next test', value: '5 days' },
      ],
    },
    {
      title: 'Earlier test',
      date: '14 days ago',
      summary: 'AI review: The tank was balanced and healthy, with no urgency for intervention at the time.',
      data: [
        { label: 'pH', value: '6.9' },
        { label: 'Ammonia', value: '0 ppm' },
        { label: 'Nitrite', value: '0 ppm' },
        { label: 'Next test', value: '7 days' },
      ],
    },
  ];

  const screenWidth = Dimensions.get('window').width;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={TANK_IMAGES[tank.tankId] ?? TANK_IMAGES['1']} style={styles.heroImage} resizeMode="cover" />

        <View style={styles.headerBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Water Test</Text>
            <View style={[styles.statusPill, conditions.waterQuality === 'Excellent' ? styles.statusExcellent : styles.statusNeedsAttention]}>
              <Text style={styles.statusText}>{conditions.waterQuality}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Last tested {conditions.lastTestedDaysAgo} days ago</Text>
          <Text style={styles.tankName}>Tank: {tank.tankName}</Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>AI summary</Text>
          <Text style={styles.summaryText}>
            {conditions.waterQuality === 'Excellent'
              ? 'The water chemistry looks balanced and the tank is in a healthy state for ongoing maintenance.'
              : 'The tank may need attention soon. Keep an eye on ammonia and nitrite levels and consider an early water change.'}
          </Text>
        </View>

        <View style={styles.dataCard}>
          <Text style={styles.dataTitle}>Latest test data</Text>
          <View style={styles.dataRow}><Text style={styles.dataLabel}>pH</Text><Text style={styles.dataValue}>{conditions.ph}</Text></View>
          <View style={styles.dataRow}><Text style={styles.dataLabel}>Temp</Text><Text style={styles.dataValue}>{conditions.preferredTempC}</Text></View>
          <View style={styles.dataRow}><Text style={styles.dataLabel}>Ammonia</Text><Text style={styles.dataValue}>{conditions.ammoniaPpm}</Text></View>
          <View style={styles.dataRow}><Text style={styles.dataLabel}>Nitrite</Text><Text style={styles.dataValue}>{conditions.nitritePpm}</Text></View>
        </View>

        <View style={styles.carouselSection}>
          <Text style={styles.carouselTitle}>Past tests</Text>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
          >
            {history.map((item) => (
              <WaterTestSummaryCard
                key={item.title}
                title={item.title}
                date={item.date}
                summary={item.summary}
                data={item.data}
                style={{ width: screenWidth - 40 }}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0F',
  },
  content: {
    paddingBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: 220,
  },
  headerBlock: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#8F97A6',
    fontSize: 14,
    marginTop: 6,
  },
  tankName: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 8,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
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
  summaryBox: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#14151B',
    borderRadius: 20,
    padding: 18,
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryText: {
    color: '#8F97A6',
    fontSize: 14,
    lineHeight: 20,
  },
  dataCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#14151B',
    borderRadius: 20,
    padding: 18,
  },
  dataTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  carouselSection: {
    marginTop: 20,
    paddingLeft: 20,
  },
  carouselTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  carouselContent: {
    paddingRight: 20,
    paddingBottom: 8,
  },
});
