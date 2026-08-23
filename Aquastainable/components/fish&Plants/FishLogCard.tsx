import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Props = {
  image: number | { uri: string };
  name: string;
  age: string;
  health: string;
  description: string;
};

export default function FishLogCard({ image, name, age, health, description }: Props) {
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fishName, setFishName] = useState(name);
  const [fishAge, setFishAge] = useState(age);
  const [fishDescription, setFishDescription] = useState(description);
  const [draftName, setDraftName] = useState(name);
  const [draftAge, setDraftAge] = useState(age);
  const [draftDescription, setDraftDescription] = useState(description);
  const closeHoldProgress = useRef(new Animated.Value(0)).current;
  const closeHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeHoldTriggered = useRef(false);
  const editHoldProgress = useRef(new Animated.Value(0)).current;
  const editHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editHoldTriggered = useRef(false);

  useEffect(() => () => {
    if (closeHoldTimer.current) {
      clearTimeout(closeHoldTimer.current);
    }
    if (editHoldTimer.current) {
      clearTimeout(editHoldTimer.current);
    }
  }, []);

  const startCloseHold = () => {
    closeHoldTriggered.current = false;
    closeHoldProgress.setValue(0);
    Animated.timing(closeHoldProgress, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
    closeHoldTimer.current = setTimeout(() => {
      closeHoldTriggered.current = true;
      closeHoldTimer.current = null;
      setIsDetailVisible(false);
    }, 500);
  };

  const startEditing = () => {
    setDraftName(fishName);
    setDraftAge(fishAge);
    setDraftDescription(fishDescription);
    setIsEditing(true);
  };

  const startEditHold = () => {
    editHoldTriggered.current = false;
    editHoldProgress.setValue(0);
    Animated.timing(editHoldProgress, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
    editHoldTimer.current = setTimeout(() => {
      editHoldTriggered.current = true;
      editHoldTimer.current = null;
      startEditing();
    }, 500);
  };

  const cancelEditHold = () => {
    if (editHoldTimer.current) {
      clearTimeout(editHoldTimer.current);
      editHoldTimer.current = null;
    }

    editHoldProgress.stopAnimation();
    if (!editHoldTriggered.current) {
      editHoldProgress.setValue(0);
    }
  };

  const saveEdits = () => {
    if (!draftName.trim() || !draftAge.trim() || !draftDescription.trim()) {
      return;
    }

    setFishName(draftName.trim());
    setFishAge(draftAge.trim());
    setFishDescription(draftDescription.trim());
    setIsEditing(false);
  };

  const cancelCloseHold = () => {
    if (closeHoldTimer.current) {
      clearTimeout(closeHoldTimer.current);
      closeHoldTimer.current = null;
    }

    closeHoldProgress.stopAnimation();
    if (!closeHoldTriggered.current) {
      closeHoldProgress.setValue(0);
    }
  };

  const closeFillWidth = closeHoldProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const editFillWidth = editHoldProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={() => setIsDetailVisible(true)} activeOpacity={0.85}>
      <Image source={image} style={styles.image} resizeMode="cover" />
      <View style={styles.body}>
        <Text style={styles.name}>{fishName}</Text>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.label}>Age</Text>
          <Text style={styles.value}>{fishAge}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Health</Text>
          <Text style={styles.value}>{health}</Text>
        </View>
      </View>
      </TouchableOpacity>

      <Modal visible={isDetailVisible} transparent animationType="fade" onRequestClose={() => setIsDetailVisible(false)}>
        <View style={styles.backdrop}>
          <TouchableOpacity style={styles.backdropTouchable} activeOpacity={1} onPress={() => setIsDetailVisible(false)} />
          <View style={styles.modalCard}>
            <Image source={image} style={styles.modalImage} resizeMode="cover" />
            <View style={styles.modalBody}>
              {isEditing ? (
                <TextInput value={draftName} onChangeText={setDraftName} style={styles.editNameInput} placeholder="Fish name" placeholderTextColor="#6E7684" />
              ) : (
                <Text style={styles.modalName}>{fishName}</Text>
              )}
              <View style={styles.modalInfoRow}>
                <View>
                  <Text style={styles.modalLabel}>Age</Text>
                  {isEditing ? (
                    <TextInput value={draftAge} onChangeText={setDraftAge} style={styles.editValueInput} placeholder="Fish age" placeholderTextColor="#6E7684" />
                  ) : (
                    <Text style={styles.modalValue}>{fishAge}</Text>
                  )}
                </View>
                <View>
                  <Text style={styles.modalLabel}>Health</Text>
                  <Text style={styles.modalValue}>{health}</Text>
                </View>
              </View>
              {isEditing ? (
                <TextInput
                  value={draftDescription}
                  onChangeText={setDraftDescription}
                  style={[styles.editDescriptionInput, styles.description]}
                  placeholder="Fish story or description"
                  placeholderTextColor="#6E7684"
                  multiline
                  textAlignVertical="top"
                />
              ) : (
                <Text style={styles.description}>{fishDescription}</Text>
              )}
              <TouchableOpacity
                style={styles.editButton}
                onPressIn={isEditing ? undefined : startEditHold}
                onPressOut={isEditing ? undefined : cancelEditHold}
                onPress={isEditing ? saveEdits : undefined}
                activeOpacity={0.9}
                accessibilityLabel={isEditing ? 'Save fish changes' : 'Hold to edit fish'}
              >
                {!isEditing ? <Animated.View style={[styles.editFill, { width: editFillWidth }]} /> : null}
                <Text style={styles.editButtonText}>{isEditing ? 'Save changes' : 'Hold to edit fish'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPressIn={startCloseHold}
                onPressOut={cancelCloseHold}
                activeOpacity={0.9}
                accessibilityLabel="Hold to close fish details"
              >
                <Animated.View style={[styles.closeFill, { width: closeFillWidth }]} />
                <Text style={styles.closeButtonText}>Hold to close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#14151B',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 0,
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 10,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: '#8F97A6',
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 12, 21, 0.78)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#16151A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalImage: {
    width: '100%',
    height: 230,
  },
  modalBody: {
    padding: 20,
  },
  modalName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 18,
  },
  editNameInput: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    marginBottom: 18,
  },
  modalInfoRow: {
    flexDirection: 'row',
    gap: 48,
    marginBottom: 18,
  },
  modalLabel: {
    color: '#8F97A6',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  modalValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  editValueInput: {
    minWidth: 90,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 2,
  },
  description: {
    color: '#B3B9C9',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  editDescriptionInput: {
    minHeight: 90,
    borderRadius: 12,
    backgroundColor: '#1B1D26',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  editButton: {
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#1B1D26',
    borderWidth: 1,
    borderColor: '#5B8CFF',
    paddingVertical: 12,
    marginBottom: 12,
  },
  editFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2563EB',
  },
  editButtonText: {
    zIndex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  closeButton: {
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#5B8CFF',
    paddingVertical: 12,
  },
  closeFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2563EB',
  },
  closeButtonText: {
    zIndex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
