import React, { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import SwipeCheckButton from './SwipeCheckButton';
import CompatibilityResultModal from './CompatibilityResultModal';

type Props = {
  visible: boolean;
  onClose: () => void;
};

type Analysis = {
  title: string;
  details: string;
  success: boolean;
  unlock: boolean;
};

const TANK_OPTIONS = [
  { id: '1', label: 'Amazonian Reef Tank' },
  { id: '2', label: 'Nano Betta Sanctuary' },
  { id: '3', label: 'Treehouse Aquascape' },
];

export default function AddPlantModal({ visible, onClose }: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [speciesQuery, setSpeciesQuery] = useState('');
  const [selectedTank, setSelectedTank] = useState<string | null>(null);
  const [schoolSize, setSchoolSize] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [compatibilityVisible, setCompatibilityVisible] = useState(false);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photos to choose an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSwipeComplete = () => {
    const plantDetail = speciesQuery.trim() || 'this plant';
    setAnalysis({
      title: 'AI Compatibility check is positive',
      details:
        `${plantDetail} looks like a good fit for the chosen tank. ` +
        'The selected setup should support this species without conflict, and it will help balance the light and nutrient cycle.',
      success: true,
      unlock: true,
    });
    setCompatibilityVisible(true);
  };

  const handleAdd = () => {
    if (!analysis?.unlock) {
      return;
    }

    Alert.alert('Mock add', 'This is a mock add flow. No plant was actually saved.');
    setImageUri(null);
    setSpeciesQuery('');
    setSelectedTank(null);
    setSchoolSize('');
    setAnalysis(null);
    setCompatibilityVisible(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.screenBackdrop}>
        <TouchableOpacity style={styles.backdropTouchable} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalCard}>
          <ScrollView contentContainerStyle={styles.content}>
<View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Add new plant</Text>
              <Text style={styles.subtitle}>Choose an image, search a plant, and assign a tank.</Text>
            </View>
            <TouchableOpacity style={styles.closeIconButton} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

            <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage} activeOpacity={0.8}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.photoPreview} resizeMode="cover" />
              ) : (
                <Text style={styles.imageText}>Pick an image</Text>
              )}
            </TouchableOpacity>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Plant</Text>
              <TextInput
                value={speciesQuery}
                onChangeText={setSpeciesQuery}
                placeholder="Search plant species"
                placeholderTextColor="#6E7684"
                style={styles.input}
              />
              <Text style={styles.helperText}>No plant lookup is active yet; this field is a mock search input.</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Tank</Text>
              <View style={styles.tankRow}>
                {TANK_OPTIONS.map((tank) => (
                  <TouchableOpacity
                    key={tank.id}
                    style={[styles.tankOption, selectedTank === tank.id && styles.tankOptionActive]}
                    onPress={() => setSelectedTank(tank.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tankLabel, selectedTank === tank.id && styles.tankLabelActive]}>{tank.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Group size / growth</Text>
              <TextInput
                value={schoolSize}
                onChangeText={setSchoolSize}
                placeholder="Example: dense patch or single plant"
                placeholderTextColor="#6E7684"
                style={styles.input}
              />
            </View>

            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Compatibility</Text>
            <SwipeCheckButton label="Swipe to check" onSwipe={handleSwipeComplete} />
          </ScrollView>
        </View>
        <CompatibilityResultModal
          visible={compatibilityVisible}
          analysis={analysis}
          typeLabel="plant"
          onClose={() => setCompatibilityVisible(false)}
          onSwipeToAdd={handleAdd}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screenBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 12, 21, 0.65)',
    justifyContent: 'center',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    marginHorizontal: 18,
    borderRadius: 28,
    backgroundColor: '#10131C',
    maxHeight: '86%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  content: {
    padding: 22,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  closeIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1B1D26',
    alignItems: 'center',
    justifyContent: 'center',
    right: 40,
    top: -10,
  },
  closeIcon: {
    color: '#B3B9C9',
    fontSize: 20,
    fontWeight: '700',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#8F97A6',
    fontSize: 14,
    marginBottom: 0,
  },
  imagePicker: {
    height: 148,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#15181F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  imageText: {
    color: '#B3B9C9',
    fontSize: 15,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  field: {
    marginBottom: 18,
  },
  fieldLabel: {
    color: '#D0D7E4',
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    height: 48,
    borderRadius: 16,
    backgroundColor: '#14151B',
    color: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  helperText: {
    marginTop: 8,
    color: '#7B869E',
    fontSize: 12,
    lineHeight: 16,
  },
  tankRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tankOption: {
    flex: 1,
    minWidth: '30%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#14151B',
  },
  tankOptionActive: {
    borderColor: '#5B8CFF',
    backgroundColor: '#18234F',
  },
  tankLabel: {
    color: '#CED5E3',
    fontSize: 12,
    fontWeight: '600',
  },
  tankLabelActive: {
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 20,
  },
  sectionLabel: {
    color: '#B3B9C9',
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
  },
  analysisBox: {
    borderRadius: 22,
    backgroundColor: '#14151B',
    padding: 18,
  },
  analysisTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  analysisTitleSuccess: {
    color: '#7DE0A2',
  },
  analysisTitleWarning: {
    color: '#FFB66A',
  },
  analysisText: {
    color: '#B3B9C9',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#5B8CFF',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  actionButtonDisabled: {
    backgroundColor: '#3A4258',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
