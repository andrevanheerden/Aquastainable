import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../app/colors';
import SwipeCheckButton from './SwipeCheckButton';

type Analysis = {
  title?: string;
  details?: string;
  explanation?: string;
  success?: boolean;
  unlock?: boolean;
  canAdd?: boolean;
  optimalSchoolSize?: string;
  maximumSchoolSize?: string;
  suggestedTankId?: string | null;
  suggestedTankName?: string;
  suggestedPlantName?: string;
};

type Props = {
  visible: boolean;
  analysis: Analysis | null;
  typeLabel: 'fish' | 'plant';
  onClose: () => void;
  onSwipeToAdd: () => void;
  onAssignSuggested?: () => void;
  onUseOptimalSchoolSize?: () => void;
  onSelectSuggestedPlant?: () => void | Promise<void>;
};

export default function CompatibilityResultModal({ visible, analysis, typeLabel, onClose, onSwipeToAdd, onAssignSuggested, onUseOptimalSchoolSize, onSelectSuggestedPlant }: Props) {
  const optimalSizeHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestedPlantHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestedPlantProgress = useRef(new Animated.Value(0)).current;
  const [suggestedPlantTriggered, setSuggestedPlantTriggered] = useState(false);
  const canAdd = analysis?.canAdd ?? analysis?.unlock ?? false;
  const buttonLabel = canAdd ? `Swipe to add ${typeLabel}` : `Swipe to return`;
  const pillLabel = canAdd ? 'Compatible' : 'Not compatible';
  const pillColor = canAdd ? Colors.success : Colors.error;

  const startOptimalSizeHold = () => {
    if (!onUseOptimalSchoolSize || !analysis?.optimalSchoolSize) {
      return;
    }

    optimalSizeHoldTimer.current = setTimeout(() => {
      onUseOptimalSchoolSize();
      optimalSizeHoldTimer.current = null;
    }, 500);
  };

  const cancelOptimalSizeHold = () => {
    if (optimalSizeHoldTimer.current) {
      clearTimeout(optimalSizeHoldTimer.current);
      optimalSizeHoldTimer.current = null;
    }
  };

  useEffect(() => () => {
    if (suggestedPlantHoldTimer.current) clearTimeout(suggestedPlantHoldTimer.current);
  }, []);

  const startSuggestedPlantHold = () => {
    if (!onSelectSuggestedPlant) return;
    setSuggestedPlantTriggered(false);
    suggestedPlantProgress.setValue(0);
    Animated.timing(suggestedPlantProgress, { toValue: 1, duration: 400, useNativeDriver: false }).start();
    suggestedPlantHoldTimer.current = setTimeout(async () => {
      setSuggestedPlantTriggered(true);
      suggestedPlantHoldTimer.current = null;
      await onSelectSuggestedPlant();
    }, 400);
  };

  const cancelSuggestedPlantHold = () => {
    if (suggestedPlantHoldTimer.current) {
      clearTimeout(suggestedPlantHoldTimer.current);
      suggestedPlantHoldTimer.current = null;
    }
    suggestedPlantProgress.stopAnimation();
    if (!suggestedPlantTriggered) suggestedPlantProgress.setValue(0);
  };

  const suggestedPlantFillWidth = suggestedPlantProgress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouchable} activeOpacity={1} onPress={onClose} />
        <View style={styles.card}>
          <View style={[styles.pill, { backgroundColor: pillColor }]}> 
            <Text style={styles.pillText}>{pillLabel}</Text>
          </View>
          <Text style={[styles.title, styles.titleWithPill]}>{analysis?.title ?? 'Compatibility result'}</Text>
          <Text style={styles.details}>{analysis?.explanation ?? analysis?.details ?? 'No analysis available.'}</Text>
          {!canAdd && analysis?.suggestedPlantName && onSelectSuggestedPlant ? (
            <View>
              <Text style={styles.suggestionText}>Suggested alternative: {analysis.suggestedPlantName}</Text>
              <TouchableOpacity style={styles.assignButton} onPressIn={startSuggestedPlantHold} onPressOut={cancelSuggestedPlantHold} activeOpacity={0.9}>
                <Animated.View style={[styles.holdFill, { width: suggestedPlantFillWidth }]} />
                <Text style={styles.assignButtonText}>Hold to select suggestion</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {analysis?.optimalSchoolSize || analysis?.maximumSchoolSize ? (
            <Text style={styles.schoolGuidance}>
              Optimal group: {analysis.optimalSchoolSize || 'Unknown'}{analysis.maximumSchoolSize ? `  |  Maximum: ${analysis.maximumSchoolSize}` : ''}
            </Text>
          ) : null}
          {!canAdd && analysis?.optimalSchoolSize && onUseOptimalSchoolSize ? (
            <TouchableOpacity
              style={styles.assignButton}
              onPressIn={startOptimalSizeHold}
              onPressOut={cancelOptimalSizeHold}
              onPress={cancelOptimalSizeHold}
            >
              <Text style={styles.assignButtonText}>Use optimal group size</Text>
            </TouchableOpacity>
          ) : null}
          {!canAdd && analysis?.suggestedTankId && onAssignSuggested ? (
            <TouchableOpacity style={styles.assignButton} onPress={onAssignSuggested}>
              <Text style={styles.assignButtonText}>Assign to {analysis.suggestedTankName || 'suggested tank'}</Text>
            </TouchableOpacity>
          ) : null}
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
  schoolGuidance: {
    color: '#D0D7E4',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  assignButton: {
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#5B8CFF',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  assignButtonText: {
    zIndex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  holdFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2563EB',
  },
  suggestionText: {
    color: '#D0D7E4',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
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
