import React, { useRef, useState } from 'react';
import { Alert, Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

type Props = {
  initialText?: string;
  initialMediaUri?: string | null;
  initialMediaUris?: string[];
  initialMediaType?: 'image' | 'video' | null;
  showOptions?: boolean;
  onShowOptionsChange?: (show: boolean) => void;
  onSend?: (text: string, mediaUri?: string) => void;
};

export default function InputBar({
  initialText = '',
  initialMediaUri = null,
  initialMediaUris = [],
  initialMediaType = null,
  showOptions = false,
  onShowOptionsChange = () => {},
  onSend = () => {},
}: Props) {
  const [text, setText] = useState<string>(initialText);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(initialMediaUri || initialMediaUris[0] || null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(initialMediaType || (initialMediaUris.length ? 'image' : null));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const pickMedia = async (source: 'camera' | 'gallery') => {
    try {
      if (source === 'camera') {
        const permission = await Camera.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission needed', 'Please allow camera access to take a photo or video.');
          return;
        }
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission needed', 'Please allow photo access to choose an attachment.');
          return;
        }
      }

      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images', 'videos'], videoMaxDuration: 5, quality: 0.9 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], selectionLimit: 1, quality: 0.9 });

      if (!result.canceled && result.assets?.[0]) {
        setSelectedMedia(result.assets[0].uri);
        setMediaType(result.assets[0].type === 'video' ? 'video' : 'image');
      }
    } finally {
      onShowOptionsChange(false);
    }
  };
  const submit = () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    onSend(trimmedText, selectedMedia ?? undefined);
    setText('');
    setSelectedMedia(null);
    setMediaType(null);
  };

  return (
    <View style={styles.container}>
      {selectedMedia ? (
        <View style={styles.attachedPreview}>
          {mediaType === 'video' ? <View style={styles.videoPreview}><Feather name="video" size={16} color="#FFFFFF" /><Text style={styles.previewText}>Video</Text></View> : <Image source={{ uri: selectedMedia }} style={styles.previewImage} />}
          <TouchableOpacity style={styles.clearButton} onPress={() => { setSelectedMedia(null); setMediaType(null); }} accessibilityLabel="Remove attachment">
            <Feather name="x" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : null}
      <View style={styles.inputArea}>
        {showOptions ? (
          <View style={styles.optionStack}>
            <TouchableOpacity style={styles.optionTile} onPress={() => pickMedia('camera')} accessibilityLabel="Open camera"><Feather name="camera" size={18} color="#FFFFFF" /></TouchableOpacity>
            <TouchableOpacity style={styles.optionTile} onPress={() => pickMedia('gallery')} accessibilityLabel="Open gallery"><Feather name="image" size={18} color="#FFFFFF" /></TouchableOpacity>
          </View>
        ) : null}
        <View
          style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}
          onTouchStart={() => inputRef.current?.focus()}
        >
          <TouchableOpacity style={styles.addIcon} onPress={() => onShowOptionsChange(!showOptions)} accessibilityLabel="Add photo or video">
            <Feather name="plus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="message Aquestanable"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={text}
            onChangeText={setText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              if (Keyboard.isVisible()) {
                requestAnimationFrame(() => inputRef.current?.focus());
              }
            }}
            onSubmitEditing={submit}
            blurOnSubmit={false}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={submit} accessibilityLabel="Send message">
            <Feather name="arrow-up" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    paddingTop: 6,
  },
  inputArea: {
    position: 'relative',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  inputWrapperFocused: {
    borderColor: '#2E8CA6',
    backgroundColor: 'rgba(46, 140, 166, 0.16)',
    shadowColor: '#2E8CA6',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  addIcon: {
    padding: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    marginHorizontal: 8,
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  sendButton: {
    padding: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E8CA6',
  },
  attachedPreview: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#2E8CA6',
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
  optionStack: {
    position: 'absolute',
    left: 6,
    bottom: 70,
    flexDirection: 'column',
    gap: 10,
    zIndex: 2,
  },
  optionTile: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
});