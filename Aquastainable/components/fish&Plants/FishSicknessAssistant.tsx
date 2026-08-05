import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import SwipeCheckButton from './SwipeCheckButton';

export type FishSicknessPrefill = {
  text: string;
  mediaUri: string | null;
  mediaType: 'image' | 'video' | null;
  speciesName: string;
};

type Props = {
  speciesName: string;
  onSendToAI: (prefill: FishSicknessPrefill) => void;
};

const HOLD_DURATION = 2000;

export default function FishSicknessAssistant({ speciesName, onSendToAI }: Props) {
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [notes, setNotes] = useState(`A ${speciesName} in the school is showing white spots and strange behavior.`);
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const intervalRef = useRef<number | null>(null);
  const holdStartRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startHold = () => {
    if (isHolding) {
      return;
    }

    setIsHolding(true);
    setHoldProgress(0);
    holdStartRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(1, elapsed / HOLD_DURATION);
      setHoldProgress(progress);

      if (progress >= 1) {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsHolding(false);
        setHoldProgress(0);
        setModalVisible(true);
      }
    }, 16) as unknown as number;
  };

  const cancelHold = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  const handlePickMedia = async (mode: 'camera' | 'gallery') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow access to your photos to attach an image or video.');
      return;
    }

    let result;
    if (mode === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
        allowsEditing: false,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
        allowsEditing: false,
      });
    }

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setMediaUri(asset.uri ?? null);
      setMediaType(asset.type === 'video' ? 'video' : 'image');
    }
  };

  const handleSend = () => {
    onSendToAI({ text: notes, mediaUri, mediaType, speciesName });
    setModalVisible(false);
    setMediaUri(null);
    setMediaType(null);
    setNotes(`A ${speciesName} in the school is showing white spots and strange behavior.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Fish sickness assistant</Text>
      <Text style={styles.sectionSubtitle}>
        Hold the button for 2 seconds to start a sickness report for your school. Then add details, attach media, and swipe to send it to the AI.
      </Text>

      <TouchableOpacity
        style={styles.holdButton}
        onPressIn={startHold}
        onPressOut={cancelHold}
        activeOpacity={0.8}
      >
        <View style={styles.holdProgressBackground}>
          <View style={[styles.holdProgressFill, { width: `${holdProgress * 100}%` }]} />
        </View>
        <Text style={styles.holdButtonText}>{isHolding ? 'Keep holding...' : 'Hold to start report'}</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={styles.backdropTouchable} activeOpacity={1} onPress={() => setModalVisible(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sickness report</Text>
            <Text style={styles.modalDescription}>Describe the fish behavior and attach a photo or video.</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Describe the white fish and its behavior..."
              placeholderTextColor="#6E7684"
              multiline
              style={styles.notesInput}
            />
            <View style={styles.mediaRow}>
              <TouchableOpacity style={styles.mediaButton} onPress={() => handlePickMedia('camera')}>
                <Text style={styles.mediaButtonText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaButton} onPress={() => handlePickMedia('gallery')}>
                <Text style={styles.mediaButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
            {mediaUri ? (
              <View style={styles.mediaPreview}>
                <Image source={{ uri: mediaUri }} style={styles.previewImage} />
                <Text style={styles.mediaLabel}>{mediaType === 'video' ? 'Video attached' : 'Photo attached'}</Text>
              </View>
            ) : null}
            <SwipeCheckButton label="Swipe to send to AI" onSwipe={handleSend} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#B3B9C9',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 18,
  },
  holdButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  holdProgressBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
  },
  holdProgressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#5B8CFF',
    borderRadius: 24,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 12, 21, 0.75)',
    justifyContent: 'center',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    marginHorizontal: 20,
    borderRadius: 28,
    backgroundColor: '#121212',
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  modalDescription: {
    color: '#B3B9C9',
    fontSize: 14,
    marginBottom: 18,
  },
  notesInput: {
    minHeight: 100,
    borderRadius: 18,
    backgroundColor: '#14151B',
    color: '#FFFFFF',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  mediaButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  mediaButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  mediaPreview: {
    marginBottom: 18,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  previewImage: {
    width: '100%',
    height: 180,
  },
  mediaLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    padding: 12,
    backgroundColor: '#0F1219',
  },
});
