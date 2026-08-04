import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

export default function InputBar() {
  const [text, setText] = useState<string>('');
  const [showOptions, setShowOptions] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  const openMediaOptions = () => setShowOptions(true);

  const handlePickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photos to attach media.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 1,
      allowsVideo: true,
      videoMaxDuration: 5,
      selectionLimit: 1,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      if (asset.type === 'video') {
        setMediaType('video');
      } else {
        setMediaType('image');
      }
      setSelectedMedia(asset.uri ?? null);
    }

    setShowOptions(false);
  };

  const handleTakePhotoOrVideo = async () => {
    const cameraPermission = await Camera.requestCameraPermissionsAsync();
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!cameraPermission.granted || !mediaPermission.granted) {
      Alert.alert('Permission needed', 'Please allow camera and photo access to take media.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      quality: 1,
      allowsVideo: true,
      videoMaxDuration: 5,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      if (asset.type === 'video') {
        setMediaType('video');
      } else {
        setMediaType('image');
      }
      setSelectedMedia(asset.uri ?? null);
    }

    setShowOptions(false);
  };

  return (
    <View style={styles.container}>
      {selectedMedia ? (
        <View style={styles.attachedPreview}>
          {mediaType === 'video' ? (
            <View style={styles.videoPreview}>
              <Feather name="video" size={16} color="#FFFFFF" />
              <Text style={styles.previewText}>Video</Text>
            </View>
          ) : (
            <Image source={{ uri: selectedMedia }} style={styles.previewImage} />
          )}
          <TouchableOpacity style={styles.clearButton} onPress={() => {
            setSelectedMedia(null);
            setMediaType(null);
          }}>
            <Feather name="x" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.inputWrapper}>
        <TouchableOpacity style={styles.addIcon} onPress={openMediaOptions}>
          <Feather name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="message Aquestanable"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={text}
          onChangeText={setText}
        />

        <TouchableOpacity style={styles.micButton}>
          <Feather name="mic" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Modal transparent visible={showOptions} animationType="fade" onRequestClose={() => setShowOptions(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowOptions(false)}>
          <View style={styles.optionStack}>
            <TouchableOpacity style={styles.optionTile} onPress={handleTakePhotoOrVideo}>
              <Feather name="camera" size={24} color="#FFFFFF" />
              <Text style={styles.optionText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionTile} onPress={handlePickFromGallery}>
              <Feather name="image" size={24} color="#FFFFFF" />
              <Text style={styles.optionText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    paddingTop: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  addIcon: {
    padding: 6,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    marginHorizontal: 8,
  },
  micButton: {
    padding: 6,
  },
  attachedPreview: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(46, 140, 166, 0.95)',
  },
  previewText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  clearButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  optionStack: {
    width: 170,
    gap: 12,
  },
  optionTile: {
    backgroundColor: '#2E8CA6',
    height: 90,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});