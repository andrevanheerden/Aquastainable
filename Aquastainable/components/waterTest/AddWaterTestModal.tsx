import React, { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import SwipeCheckButton from '../fish&Plants/SwipeCheckButton';
import useWaterTestApi from '../../app/hooks/useWaterTestApi';

type Props = { visible: boolean; tankId: string; userId: string; onClose: () => void; onSaved: () => void };

export default function AddWaterTestModal({ visible, tankId, userId, onClose, onSaved }: Props) {
  const { saveWaterTest, loading } = useWaterTestApi();
  const [image, setImage] = useState('');
  const [readings, setReadings] = useState({ ph: '', temperatureC: '', ammoniaPpm: '', nitritePpm: '', nitratePpm: '', chlorine: '' });
  const [validationError, setValidationError] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, base64: true });
    if (!result.canceled && result.assets[0]?.base64) setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
  };

  const setReading = (key: keyof typeof readings, value: string) => {
    setValidationError('');
    setReadings((current) => ({ ...current, [key]: value }));
  };

  const submit = async () => {
    if (!readings.ph.trim() || !readings.temperatureC.trim()) {
      setValidationError('Enter both pH and water temperature before saving. The other readings are optional.');
      return;
    }

    try {
      const filledReadings = Object.fromEntries(
        Object.entries(readings).filter(([, value]) => value.trim() !== ''),
      );
      const savedTest = await saveWaterTest({ userId, tankId, testedAt: new Date().toISOString(), readings: filledReadings, image: image || undefined });
      Alert.alert(
        'Water test saved',
        savedTest.imageUploadSkipped
          ? 'The test was saved, but the image was not uploaded. Add CLOUDINARY_URL to the backend to save images.'
          : 'The AI summary and next water-change recommendation have been saved.',
      );
      setReadings({ ph: '', temperatureC: '', ammoniaPpm: '', nitritePpm: '', nitratePpm: '', chlorine: '' });
      setValidationError('');
      setImage('');
      onSaved();
      onClose();
    } catch (error) {
      Alert.alert('Could not save test', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.backdrop}><TouchableOpacity style={styles.dismiss} onPress={onClose} /><View style={styles.card}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}><Text style={styles.title}>Add water test</Text><TouchableOpacity onPress={onClose}><Text style={styles.close}>X</Text></TouchableOpacity></View>
        <TouchableOpacity style={styles.imageBox} onPress={pickImage}>{image ? <Image source={{ uri: image }} style={styles.image} /> : <Text style={styles.muted}>Add test strip image (optional)</Text>}</TouchableOpacity>
        {Object.keys(readings).map((key) => <View style={styles.field} key={key}><Text style={styles.label}>{key}{(key === 'ph' || key === 'temperatureC') ? ' *' : ' (optional)'}</Text><TextInput value={readings[key as keyof typeof readings]} onChangeText={(value) => setReading(key as keyof typeof readings, value)} placeholder="~" placeholderTextColor="#6E7684" style={styles.input} /></View>)}
        {validationError ? <Text style={styles.error}>{validationError}</Text> : null}
        <SwipeCheckButton label={loading ? 'Saving water test...' : 'Swipe to review and save'} onSwipe={submit} disabled={loading} />
      </ScrollView>
    </View></View>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(7,12,21,0.75)', justifyContent: 'center' },
  dismiss: { ...StyleSheet.absoluteFillObject },
  card: { marginHorizontal: 18, maxHeight: '86%', borderRadius: 24, backgroundColor: '#16151A', overflow: 'hidden' },
  content: { padding: 22 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  close: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  imageBox: { height: 130, borderRadius: 16, backgroundColor: '#1B1D26', alignItems: 'center', justifyContent: 'center', marginBottom: 18, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  muted: { color: '#8F97A6' },
  field: { marginBottom: 12 },
  label: { color: '#D0D7E4', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  input: { height: 44, borderRadius: 12, backgroundColor: '#14151B', color: '#FFFFFF', paddingHorizontal: 12 },
  error: { color: '#FF8A8A', fontSize: 13, marginBottom: 12 },
});
