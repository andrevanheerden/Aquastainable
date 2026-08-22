import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View, Image, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';

import WaterTestSummaryCard from '../../components/waterTest/WaterTestSummaryCard';
import AddWaterTestModal from '../../components/waterTest/AddWaterTestModal';
import HoldToOpenButton from '../../components/waterTest/HoldToOpenButton';
import { auth } from '@/firebase';
import { useTankApi } from '../hooks/useTankApi';
import useWaterTestApi, { WaterTestRecord } from '../hooks/useWaterTestApi';

const TANK_IMAGES = {
  '1': require('../../assets/fishTank/FishTankForest.jpeg'),
  '2': require('../../assets/fishTank/FishTankLiveingRoom.jpeg'),
  '3': require('../../assets/fishTank/FishTankTree.jpeg'),
};

export default function WaterTestDetailsScreen() {
  const { tankId } = useLocalSearchParams<{ tankId?: string }>();
  const { getTankById } = useTankApi();
  const { getTankWaterTests } = useWaterTestApi();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [tank, setTank] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addTestVisible, setAddTestVisible] = useState(false);
  const [latestTest, setLatestTest] = useState<WaterTestRecord | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUserId(user?.uid ?? null));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!tankId) {
      setLoading(false);
      return;
    }

    if (!currentUserId) {
      return;
    }

    setLoading(true);
    Promise.all([getTankById(currentUserId, tankId), getTankWaterTests(tankId).catch(() => [])])
      .then(([apiTank, tests]) => {
        const newestTest = [...tests].sort((left, right) => right.testedAt.localeCompare(left.testedAt))[0] || null;
        setLatestTest(newestTest);
        setTank({
          tankId: apiTank.tankId || apiTank.id,
          tankName: apiTank.tankName || 'Unnamed tank',
          tankImg: apiTank.tankImg || '',
          conditions: {
            preferredTempC: apiTank.preferredTempC || apiTank.temperatureC || '~',
            waterQuality: newestTest?.waterQuality || apiTank.waterQuality || '~',
            lastTestedDaysAgo: newestTest ? Math.floor((Date.now() - new Date(newestTest.testedAt).getTime()) / 86400000) : apiTank.lastTestedDaysAgo ?? '~',
            ph: newestTest?.readings?.ph || apiTank.ph || '~',
            ammoniaPpm: newestTest?.readings?.ammoniaPpm ?? apiTank.ammoniaPpm ?? '~',
            nitritePpm: newestTest?.readings?.nitritePpm ?? apiTank.nitritePpm ?? '~',
          },
        });
      })
      .catch(() => setTank(null))
      .finally(() => setLoading(false));
  }, [currentUserId, getTankById, getTankWaterTests, tankId]);

  if (loading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator color="#FFFFFF" /></SafeAreaView>;
  }

  if (!tank) {
    return <SafeAreaView style={styles.container}><Text style={styles.emptyText}>Tank data unavailable.</Text></SafeAreaView>;
  }

  const latestTestAge = latestTest ? Math.max(0, Math.floor((Date.now() - new Date(latestTest.testedAt).getTime()) / 86400000)) : null;
  const conditions = latestTest ? {
    ...tank.conditions,
    waterQuality: latestTest.waterQuality || tank.conditions.waterQuality,
    lastTestedDaysAgo: latestTestAge,
    ph: latestTest.readings?.ph || '~',
    temperatureC: latestTest.readings?.temperatureC || '~',
    preferredTempC: latestTest.readings?.temperatureC || '~',
    ammoniaPpm: latestTest.readings?.ammoniaPpm ?? '~',
    nitritePpm: latestTest.readings?.nitritePpm ?? '~',
  } : tank.conditions;
  const hasTestDate = typeof conditions.lastTestedDaysAgo === 'number';
  const nextTestDue = hasTestDate ? (conditions.lastTestedDaysAgo >= 7 ? 'Due now' : `${7 - conditions.lastTestedDaysAgo} days`) : '~';
  const testDate = hasTestDate ? `${conditions.lastTestedDaysAgo} days ago` : '~';
  const hasTestData = conditions.ph !== '~' || conditions.ammoniaPpm !== '~' || conditions.nitritePpm !== '~';
  const history = [
    {
      title: 'Latest test',
      date: testDate,
      summary: hasTestData ? `AI review: ${conditions.waterQuality === 'Excellent' ? 'Water quality is stable and the tank is in good condition.' : 'The tank needs attention and should be monitored closely.'}` : 'No water test data yet.',
      data: [
        { label: 'pH', value: conditions.ph },
        { label: 'Ammonia', value: conditions.ammoniaPpm },
        { label: 'Nitrite', value: conditions.nitritePpm },
        { label: 'Next test', value: nextTestDue },
      ],
    },
    {
      title: 'Previous test',
      date: '~',
      summary: 'No previous water test data yet.',
      data: [
        { label: 'pH', value: '~' },
        { label: 'Ammonia', value: '~' },
        { label: 'Nitrite', value: '~' },
        { label: 'Next test', value: '~' },
      ],
    },
    {
      title: 'Earlier test',
      date: '~',
      summary: 'No earlier water test data yet.',
      data: [
        { label: 'pH', value: '~' },
        { label: 'Ammonia', value: '~' },
        { label: 'Nitrite', value: '~' },
        { label: 'Next test', value: '~' },
      ],
    },
  ];

  const screenWidth = Dimensions.get('window').width;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={tank.tankImg ? { uri: tank.tankImg } : TANK_IMAGES[tank.tankId as keyof typeof TANK_IMAGES] ?? TANK_IMAGES['1']} style={styles.heroImage} resizeMode="cover" />

        <View style={styles.headerBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Water Test</Text>
            <View style={[styles.statusPill, conditions.waterQuality === 'Excellent' ? styles.statusExcellent : styles.statusNeedsAttention]}>
              <Text style={styles.statusText}>{conditions.waterQuality}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Last tested {testDate}</Text>
          <Text style={styles.tankName}>Tank: {tank.tankName}</Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>AI summary</Text>
          <Text style={styles.summaryText}>
            {latestTest?.summary || (conditions.waterQuality === '~'
              ? 'No water test data yet. Add a test to see water-quality insights.'
              : conditions.waterQuality === 'Excellent'
              ? 'The water chemistry looks balanced and the tank is in a healthy state for ongoing maintenance.'
              : 'The tank may need attention soon. Keep an eye on ammonia and nitrite levels and consider an early water change.')}
          </Text>
          {latestTest?.nextWaterChange ? <Text style={styles.nextChange}>Next change: {latestTest.nextWaterChange}</Text> : null}
        </View>

        <HoldToOpenButton onHold={() => setAddTestVisible(true)} />

        <View style={styles.dataCard}>
          <Text style={styles.dataTitle}>Latest test data</Text>
          <View style={styles.dataRow}><Text style={styles.dataLabel}>pH</Text><Text style={styles.dataValue}>{conditions.ph || '~'}</Text></View>
          <View style={styles.dataRow}><Text style={styles.dataLabel}>Temp</Text><Text style={styles.dataValue}>{conditions.preferredTempC || '~'}</Text></View>
          <View style={styles.dataRow}><Text style={styles.dataLabel}>Ammonia</Text><Text style={styles.dataValue}>{conditions.ammoniaPpm ?? '~'}</Text></View>
          <View style={styles.dataRow}><Text style={styles.dataLabel}>Nitrite</Text><Text style={styles.dataValue}>{conditions.nitritePpm ?? '~'}</Text></View>
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
      {currentUserId ? <AddWaterTestModal visible={addTestVisible} tankId={tank.tankId} userId={currentUserId} onClose={() => setAddTestVisible(false)} onSaved={() => { setAddTestVisible(false); getTankWaterTests(tank.tankId).then((tests) => setLatestTest([...tests].sort((left, right) => right.testedAt.localeCompare(left.testedAt))[0] || null)).catch(() => undefined); }} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0F',
  },
  emptyText: {
    color: '#8F97A6',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
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
  nextChange: {
    color: '#D0D7E4',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
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
