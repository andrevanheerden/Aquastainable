import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../app/colors';
import SwipeCheckButton from './SwipeCheckButton';

type Analysis = {
  title: string;
  details: string;
  success: boolean;
  unlock: boolean;
};

type Props = {
  visible: boolean;
  analysis: Analysis | null;
  typeLabel: 'fish' | 'plant';
  onClose: () => void;
  onSwipeToAdd: () => void;
};

export default function CompatibilityResultModal({ visible, analysis, typeLabel, onClose, onSwipeToAdd }: Props) {
  const canAdd = analysis?.unlock ?? false;
  const buttonLabel = canAdd ? `Swipe to add ${typeLabel}` : `Swipe to return`;
  const pillLabel = canAdd ? 'Compatible' : 'Not compatible';
  const pillColor = canAdd ? Colors.success : Colors.error;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouchable} activeOpacity={1} onPress={onClose} />
        <View style={styles.card}>
          <View style={[styles.pill, { backgroundColor: pillColor }]}> 
            <Text style={styles.pillText}>{pillLabel}</Text>
          </View>
          <Text style={[styles.title, styles.titleWithPill]}>{analysis?.title ?? 'Compatibility result'}</Text>
          <Text style={styles.details}>{analysis?.details ?? 'No analysis available.'}</Text>
          <View style={styles.divider} />
          <SwipeCheckButton
            label={buttonLabel}
            onSwipe={canAdd ? onSwipeToAdd : onClose}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 12, 21, 0.75)',
    justifyContent: 'center',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 28,
    backgroundColor: '#16151A',
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  titleWithPill: {
    marginTop: 36,
  },
  details: {
    color: '#B3B9C9',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 22,
  },
  pill: {
    position: 'absolute',
    top: 20,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    zIndex: 1,
  },
  pillText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryLabel: {
    color: '#8F97A6',
    fontSize: 12,
    marginTop: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
});
