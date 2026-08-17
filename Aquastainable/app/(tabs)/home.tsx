// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  Modal,
  PanResponder,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors from '../colors';
import { auth } from '@/firebase';
import { useTankApi } from '../hooks/useTankApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const aquariumImage1 = require('../../assets/fishTank/FishTankForest.jpeg');
const aquariumImage2 = require('../../assets/fishTank/FishTankLiveingRoom.jpeg');
const aquariumImage3 = require('../../assets/fishTank/FishTankTree.jpeg');

const DEFAULT_TANK = {
  id: 'placeholder',
  tankId: 'placeholder',
  user_id: 'guest',
  tankName: 'Add your first tank',
  tankImg: '',
  waterType: 'Freshwater',
  tankSize: 20,
  overview: '',
  aquaCare: {},
};

const SWIPE_THUMB_SIZE = 52;
const SWIPE_PADDING = 4;

function SwipeButton({ onSwipe }: { onSwipe: () => void }) {
  const pan = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const containerWidthRef = useRef(0);

  const maxTranslate = Math.max(0, containerWidth - SWIPE_THUMB_SIZE - SWIPE_PADDING * 2);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (_, gestureState) => {
        const activeMaxTranslate = Math.max(0, containerWidthRef.current - SWIPE_THUMB_SIZE - SWIPE_PADDING * 2);
        const newValue = Math.max(0, Math.min(gestureState.dx, activeMaxTranslate));
        pan.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        const activeMaxTranslate = Math.max(0, containerWidthRef.current - SWIPE_THUMB_SIZE - SWIPE_PADDING * 2);

        if (gestureState.dx >= activeMaxTranslate * 0.75) {
          Animated.timing(pan, { toValue: activeMaxTranslate, duration: 120, useNativeDriver: true }).start(() => {
            onSwipe();
            setTimeout(() => {
              Animated.spring(pan, { toValue: 0, friction: 6, useNativeDriver: true }).start();
            }, 600);
          });
        } else {
          Animated.spring(pan, { toValue: 0, friction: 5, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const textOpacity = pan.interpolate({
    inputRange: [0, Math.max(1, maxTranslate * 0.5)],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={styles.swipeTrack}
      onLayout={(e) => {
        containerWidthRef.current = e.nativeEvent.layout.width;
        setContainerWidth(e.nativeEvent.layout.width);
      }}
    >
      <Animated.Text style={[styles.swipeText, { opacity: textOpacity }]}>SWIPE FOR TANK INFO</Animated.Text>
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.swipeThumb, { transform: [{ translateX: pan }] }]}
      >
        <IconSymbol name="chevron.right" size={22} color={Colors.white} style={styles.swipeIcon} />
      </Animated.View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { createTank, getUserTanks, loading } = useTankApi();
  const [tanks, setTanks] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeMetricIndex, setActiveMetricIndex] = useState(0);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [form, setForm] = useState({
    tankName: '',
    tankImg: '',
    waterType: 'Freshwater',
    tankSize: '20',
  });

  const metricsCardWidth = (SCREEN_WIDTH - 40 - 16) / 3;
  const metricsCardGap = 8;
  const metricsStepWidth = metricsCardWidth + metricsCardGap;

  const userId = auth.currentUser?.uid;

  const loadTanks = async () => {
    if (!userId) {
      setTanks([]);
      return;
    }

    try {
      const response = await getUserTanks(userId);
      setTanks(Array.isArray(response) ? response : []);
      setActiveIndex(0);
    } catch (error) {
      setTanks([]);
    }
  };

  useEffect(() => {
    loadTanks();
  }, [userId]);

  const screenPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 20,
      onPanResponderRelease: (_, gestureState) => {
        if (tanks.length === 0) {
          return;
        }

        if (gestureState.dy < -40) {
          setActiveIndex((prev) => (prev + 1) % tanks.length);
        } else if (gestureState.dy > 40) {
          setActiveIndex((prev) => (prev - 1 + tanks.length) % tanks.length);
        }
      },
    })
  ).current;

  const aquarium = tanks[activeIndex] || DEFAULT_TANK;
  const currentNumber = tanks.length > 0 ? activeIndex + 1 : 1;
  const tankImage = aquarium.tankImg ? { uri: aquarium.tankImg } : aquariumImage1;

  const metricsData = [
    { id: '1', label: 'WATER TYPE', value: aquarium.waterType || 'Freshwater', accent: Colors.lightBlue },
    { id: '2', label: 'VOLUME', value: `${Number(aquarium.tankSize || 0)} L`, accent: Colors.white },
    { id: '3', label: 'OVERVIEW', value: aquarium.overview ? 'Ready' : 'Add info', accent: Colors.lightBlue },
  ];

  const metricPageCount = metricsData.length;

  const resetForm = () => {
    setForm({ tankName: '', tankImg: '', waterType: 'Freshwater', tankSize: '20' });
  };

  const handleCreateTank = async () => {
    if (!userId) {
      Alert.alert('Login required', 'Please sign in before creating a tank.');
      return;
    }

    if (!form.tankName.trim() || !form.waterType.trim() || !form.tankSize) {
      Alert.alert('Missing details', 'Please fill in the tank name, water type, and size.');
      return;
    }

    try {
      await createTank({
        user_id: userId,
        tankName: form.tankName.trim(),
        tankImg: form.tankImg.trim(),
        waterType: form.waterType.trim(),
        tankSize: Number(form.tankSize),
        overview: '',
        aquaCare: {},
      });

      setIsAddModalVisible(false);
      resetForm();
      await loadTanks();
    } catch (error) {
      Alert.alert('Tank create failed', error.message || 'Please try again.');
    }
  };

  return (
    <View style={styles.container} {...screenPanResponder.panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ImageBackground source={tankImage} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.overlayGradient} />

        <SafeAreaView style={styles.contentContainer}>
          <View style={styles.topHeader}>
            <Text style={styles.brandTitle}>AQUASTAINABLE</Text>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>
                {String(currentNumber).padStart(2, '0')} / {Math.max(tanks.length || 1, 1)}
              </Text>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.statusBadgeContainer}>
              <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.statusText}>{tanks.length > 0 ? 'Active' : 'No tank yet'}</Text>
            </View>

            <Text style={styles.aquariumTitle}>{aquarium.tankName}</Text>

            <View style={styles.metricsCarouselWrap}>
              <FlatList
                data={metricsData}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={metricsStepWidth}
                snapToAlignment="start"
                decelerationRate="fast"
                contentContainerStyle={styles.metricsListContent}
                onMomentumScrollEnd={(event) => {
                  const offsetX = event.nativeEvent.contentOffset.x;
                  const nextIndex = Math.round(offsetX / metricsStepWidth);
                  setActiveMetricIndex(Math.min(Math.max(nextIndex, 0), metricPageCount - 1));
                }}
                getItemLayout={(_, index) => ({
                  length: metricsStepWidth,
                  offset: metricsStepWidth * index,
                  index,
                })}
                renderItem={({ item }) => (
                  <View style={[styles.metricCard, { width: metricsCardWidth }]}>
                    <View style={styles.metricCardGlow} />
                    <Text style={styles.metricLabel}>{item.label}</Text>
                    <Text style={[styles.metricValue, { color: item.accent }]}>{item.value}</Text>
                  </View>
                )}
              />

              <View style={styles.metricDots}>
                {Array.from({ length: metricPageCount }).map((_, index) => (
                  <View
                    key={`metric-page-${index}`}
                    style={[styles.metricDot, index === activeMetricIndex && styles.metricDotActive]}
                  />
                ))}
              </View>
            </View>

            {tanks.length > 0 && (
              <SwipeButton onSwipe={() => router.push(`/tank/${aquarium.tankId || aquarium.id}`)} />
            )}
          </View>
        </SafeAreaView>
      </ImageBackground>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsAddModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      <Modal visible={isAddModalVisible} transparent animationType="slide" onRequestClose={() => setIsAddModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsAddModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add new tank</Text>

            <TextInput
              style={styles.input}
              placeholder="Tank name"
              placeholderTextColor="#8a8a8a"
              value={form.tankName}
              onChangeText={(value) => setForm((prev) => ({ ...prev, tankName: value }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Tank image URL"
              placeholderTextColor="#8a8a8a"
              value={form.tankImg}
              onChangeText={(value) => setForm((prev) => ({ ...prev, tankImg: value }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Water type"
              placeholderTextColor="#8a8a8a"
              value={form.waterType}
              onChangeText={(value) => setForm((prev) => ({ ...prev, waterType: value }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Tank size"
              keyboardType="numeric"
              placeholderTextColor="#8a8a8a"
              value={form.tankSize}
              onChangeText={(value) => setForm((prev) => ({ ...prev, tankSize: value }))}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsAddModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleCreateTank} disabled={loading}>
                <Text style={styles.submitButtonText}>{loading ? 'Saving...' : 'Create tank'}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22, 21, 26, 0.55)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  pagePill: {
    backgroundColor: 'rgba(18, 18, 18, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pagePillText: {
    color: Colors.lightBlue,
    fontSize: 12,
    fontWeight: '700',
  },
  bottomSection: {
    marginBottom: 20,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  aquariumTitle: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  metricsCarouselWrap: {
    marginBottom: 20,
  },
  metricsListContent: {
    paddingHorizontal: 0,
  },
  metricCard: {
    height: 76,
    backgroundColor: Colors.background,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 5,
  },
  metricCardGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  metricLabel: {
    color: Colors.gray,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metricValue: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  metricDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  metricDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 3,
  },
  metricDotActive: {
    width: 18,
    backgroundColor: Colors.lightBlue,
    borderRadius: 999,
  },
  swipeTrack: {
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 30,
    justifyContent: 'center',
    padding: SWIPE_PADDING,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
  },
  swipeText: {
    position: 'absolute',
    alignSelf: 'center',
    color: Colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  swipeThumb: {
    width: SWIPE_THUMB_SIZE,
    height: SWIPE_THUMB_SIZE,
    borderRadius: SWIPE_THUMB_SIZE / 2,
    backgroundColor: Colors.info || '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  swipeIcon: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 30,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
  },
  fabText: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: '600',
    marginTop: -4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    backgroundColor: '#1b1d25',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#2a2e39',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.white,
    marginBottom: 12,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2c313d',
    borderRadius: 12,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.lightBlue,
    borderRadius: 12,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: Colors.white,
    fontWeight: '700',
  },
});