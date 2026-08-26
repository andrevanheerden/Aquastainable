// @ts-nocheck
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
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
import { useFocusEffect, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { onAuthStateChanged } from 'firebase/auth';

import { IconSymbol } from '@/components/ui/icon-symbol';
import HoldButton from '@/components/ui/HoldButton';
import Colors from '../colors';
import { auth } from '@/firebase';
import { useTankApi } from '../hooks/useTankApi';
import WaterChangeToast from '@/components/WaterChangeToast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SWIPE_THUMB_SIZE = 52;
const SWIPE_PADDING = 4;

function SwipeButton({ onSwipe }: { onSwipe: () => void }) {
  const pan = useRef(new Animated.Value(0)).current;
  const onSwipeRef = useRef(onSwipe);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerWidthRef = useRef(0);

  onSwipeRef.current = onSwipe;

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
            onSwipeRef.current();
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const tanksRef = useRef<any[]>([]);
  const [form, setForm] = useState({
    tankName: '',
    tankImg: '',
    waterType: 'Freshwater',
    tankSize: '20',
  });

  const metricsCardWidth = (SCREEN_WIDTH - 40 - 16) / 3;
  const metricsCardGap = 8;
  const metricsStepWidth = metricsCardWidth + metricsCardGap;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user?.uid ?? null);
    });

    return () => unsubscribe();
  }, []);

  const loadTanks = useCallback(async () => {
    if (!currentUserId) {
      setTanks([]);
      tanksRef.current = [];
      return;
    }

    try {
      const response = await getUserTanks(currentUserId);
      const nextTanks = Array.isArray(response) ? response : [];
      tanksRef.current = nextTanks;
      setTanks(nextTanks);
      setActiveIndex(0);
    } catch (error) {
      setTanks([]);
      tanksRef.current = [];
    }
  }, [currentUserId, getUserTanks]);

  useFocusEffect(useCallback(() => {
    loadTanks();
  }, [loadTanks]));

  const screenPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 20,
      onPanResponderRelease: (_, gestureState) => {
        const tankCount = tanksRef.current.length;
        if (tankCount === 0) {
          return;
        }

        if (gestureState.dy < -40) {
          setActiveIndex((prev) => (prev + 1) % tankCount);
        } else if (gestureState.dy > 40) {
          setActiveIndex((prev) => (prev - 1 + tankCount) % tankCount);
        }
      },
    })
  ).current;

  const aquarium = tanks[activeIndex];
  const currentNumber = activeIndex + 1;
  const tankImage = aquarium?.tankImg ? { uri: aquarium.tankImg } : undefined;

  const metricsData = [
    { id: '1', label: 'WATER TYPE', value: aquarium?.waterType || 'Not available', accent: Colors.lightBlue },
    { id: '2', label: 'VOLUME', value: aquarium ? `${Number(aquarium.tankSize || 0)} L` : 'Not available', accent: Colors.white },
    { id: '3', label: 'OVERVIEW', value: aquarium?.overview ? 'Ready' : 'Not available', accent: Colors.lightBlue },
  ];

  const metricPageCount = metricsData.length;

  const resetForm = () => {
    setForm({ tankName: '', tankImg: '', waterType: 'Freshwater', tankSize: '20' });
  };

  const handlePickTankImage = async (source: 'library' | 'camera') => {
    try {
      const pickerResult = source === 'library'
        ? await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
            base64: true,
          })
        : await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
            base64: true,
          });

      if (pickerResult.canceled || !pickerResult.assets?.[0]) {
        return;
      }

      const asset = pickerResult.assets[0];
      const imageData = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;

      setForm((prev) => ({ ...prev, tankImg: imageData }));
    } catch (error) {
      Alert.alert('Image error', 'Unable to pick an image right now.');
    }
  };

  const handleCreateTank = async () => {
    if (!currentUserId) {
      Alert.alert('Login required', 'Please sign in before creating a tank.');
      return;
    }

    if (!form.tankName.trim() || !form.waterType.trim() || !form.tankSize) {
      Alert.alert('Missing details', 'Please fill in the tank name, water type, and size.');
      return;
    }

    try {
      await createTank({
        user_id: currentUserId,
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
      <WaterChangeToast />
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      {tanks.length > 0 ? <ImageBackground source={tankImage} style={styles.backgroundImage} resizeMode="cover">
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

            <Text style={styles.aquariumTitle}>{aquarium?.tankName}</Text>

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
              <SwipeButton onSwipe={() => router.push({ pathname: '/(tabs)/tank/[id]', params: { id: String(aquarium.tankId || aquarium.id) } })} />
            )}
          </View>
        </SafeAreaView>
      </ImageBackground> : <SafeAreaView style={styles.emptyHome}><Text style={styles.emptyHomeText}>No tanks have been added yet.</Text></SafeAreaView>}

      <HoldButton
        style={styles.fab}
        onHold={() => setIsAddModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>＋</Text>
      </HoldButton>

      <Modal visible={isAddModalVisible} transparent animationType="slide" onRequestClose={() => setIsAddModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsAddModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add new tank</Text>
            <Text style={styles.fieldHeader}>Please add the details below</Text>

            <Text style={styles.label}>Tank image</Text>
            <View style={styles.imagePickerRow}>
              <HoldButton style={styles.imagePickerButton} onHold={() => handlePickTankImage('library')}>
                <Text style={styles.imagePickerButtonText}>Choose from gallery</Text>
              </HoldButton>
              <HoldButton style={styles.imagePickerButtonSecondary} onHold={() => handlePickTankImage('camera')}>
                <Text style={styles.imagePickerButtonText}>Use camera</Text>
              </HoldButton>
            </View>

            {form.tankImg ? (
              <Image source={{ uri: form.tankImg }} style={styles.previewImage} resizeMode="cover" />
            ) : null}

            <Text style={styles.label}>Tank name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter tank name"
              placeholderTextColor="#8a8a8a"
              value={form.tankName}
              onChangeText={(value) => setForm((prev) => ({ ...prev, tankName: value }))}
            />

            <Text style={styles.label}>Water type</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter water type"
              placeholderTextColor="#8a8a8a"
              value={form.waterType}
              onChangeText={(value) => setForm((prev) => ({ ...prev, waterType: value }))}
            />

            <Text style={styles.label}>Tank size (litres)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter tank size in litres"
              keyboardType="numeric"
              placeholderTextColor="#8a8a8a"
              value={form.tankSize}
              onChangeText={(value) => setForm((prev) => ({ ...prev, tankSize: value }))}
            />

            <View style={styles.modalActions}>
              <HoldButton style={styles.cancelButton} onHold={() => setIsAddModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </HoldButton>
              <HoldButton style={styles.submitButton} onHold={handleCreateTank} disabled={loading}>
                <Text style={styles.submitButtonText}>{loading ? 'Saving...' : 'Create tank'}</Text>
              </HoldButton>
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
  emptyHome: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  emptyHomeText: {
    color: Colors.white,
    fontSize: 16,
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
    marginBottom: 8,
  },
  fieldHeader: {
    color: '#c7d4ff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 18,
  },
  label: {
    color: '#dfe7ff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.4,
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
  imagePickerRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  imagePickerButton: {
    flex: 1,
    backgroundColor: '#2a7dff',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  imagePickerButtonSecondary: {
    flex: 1,
    backgroundColor: '#3c4658',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  imagePickerButtonText: {
    color: Colors.white,
    fontWeight: '700',
  },
  previewImage: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: '#2a2e39',
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