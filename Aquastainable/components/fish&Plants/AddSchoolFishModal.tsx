import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export type FishRecord = {
  id: string;
  name: string;
  age: string;
  health: string;
  description: string;
  schoolStatus: 'new' | 'existing';
  image: number | { uri: string };
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (fish: FishRecord) => void;
};

export default function AddSchoolFishModal({ visible, onClose, onSave }: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [story, setStory] = useState('');
  const [schoolStatus, setSchoolStatus] = useState<'new' | 'existing'>('new');
  const addHoldProgress = useRef(new Animated.Value(0)).current;
  const addHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addHoldTriggered = useRef(false);

  useEffect(() => () => {
    if (addHoldTimer.current) {
      clearTimeout(addHoldTimer.current);
    }
  }, []);

  const resetForm = () => {
    setImageUri(null);
    setName('');
    setAge('');
    setStory('');
    setSchoolStatus('new');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photos to choose a fish image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!imageUri || !name.trim() || !age.trim() || !story.trim()) {
      Alert.alert('Missing information', 'Please add an image, name, age, and story for this fish.');
      return;
    }

    onSave({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      age: age.trim(),
      health: 'Healthy',
      description: story.trim(),
      schoolStatus,
      image: { uri: imageUri },
    });
    resetForm();
    onClose();
  };

  const startAddHold = () => {
    addHoldTriggered.current = false;
    addHoldProgress.setValue(0);
    Animated.timing(addHoldProgress, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
    addHoldTimer.current = setTimeout(() => {
      addHoldTriggered.current = true;
      addHoldTimer.current = null;
      handleSave();
    }, 500);
  };

  const cancelAddHold = () => {
    if (addHoldTimer.current) {
      clearTimeout(addHoldTimer.current);
      addHoldTimer.current = null;
    }

    addHoldProgress.stopAnimation();
    if (!addHoldTriggered.current) {
      addHoldProgress.setValue(0);
    }
  };

  const addFillWidth = addHoldProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouchable} activeOpacity={1} onPress={handleClose} />
        <View style={styles.modalCard}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>Add fish to school</Text>
                <Text style={styles.subtitle}>Create a profile for your fish.</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.8}>
                <Text style={styles.closeText}>X</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage} activeOpacity={0.8}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
              ) : (
                <Text style={styles.imagePickerText}>Choose fish image</Text>
              )}
            </TouchableOpacity>

            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter a name"
                placeholderTextColor="#6E7684"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="Example: 1.5 yrs"
                placeholderTextColor="#6E7684"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Story or description</Text>
              <TextInput
                value={story}
                onChangeText={setStory}
                placeholder="Tell the story of this fish..."
                placeholderTextColor="#6E7684"
                style={[styles.input, styles.storyInput]}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>School status</Text>
              <View style={styles.toggleTrack}>
                <TouchableOpacity
                  style={[styles.toggleOption, schoolStatus === 'new' && styles.toggleOptionActive]}
                  onPress={() => setSchoolStatus('new')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.toggleText, schoolStatus === 'new' && styles.toggleTextActive]}>New to school</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleOption, schoolStatus === 'existing' && styles.toggleOptionActive]}
                  onPress={() => setSchoolStatus('existing')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.toggleText, schoolStatus === 'existing' && styles.toggleTextActive]}>Already in school</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPressIn={startAddHold}
              onPressOut={cancelAddHold}
              activeOpacity={0.9}
              accessibilityLabel="Hold to add fish to school"
            >
              <Animated.View style={[styles.saveFill, { width: addFillWidth }]} />
              <Text style={styles.saveText}>Hold to add fish</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 12, 21, 0.78)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    maxHeight: '88%',
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#10131C',
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
    marginBottom: 18,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: '#8F97A6',
    fontSize: 13,
    marginTop: 5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1B1D26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#B3B9C9',
    fontSize: 16,
    fontWeight: '700',
  },
  imagePicker: {
    height: 180,
    borderRadius: 18,
    backgroundColor: '#1B1D26',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePickerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: '#B3B9C9',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#1B1D26',
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    fontSize: 14,
  },
  storyInput: {
    minHeight: 110,
  },
  toggleTrack: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    backgroundColor: '#1B1D26',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  toggleOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  toggleOptionActive: {
    backgroundColor: '#5B8CFF',
  },
  toggleText: {
    color: '#8F97A6',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#5B8CFF',
    paddingVertical: 14,
    marginTop: 4,
  },
  saveFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2563EB',
  },
  saveText: {
    zIndex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
