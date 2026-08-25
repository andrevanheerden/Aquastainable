import React, { useEffect, useRef } from 'react';
import { Animated, View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
const AnimatedFill = Animated.View as any;

type Props = {
  onBack: () => void;
  onMenu: () => void;
};

export default function HeaderRow({ onBack, onMenu }: Props) {
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
  }, []);

  const startEditHold = () => {
    holdProgress.setValue(0);
    Animated.timing(holdProgress, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    holdTimer.current = setTimeout(() => {
      holdTimer.current = null;
      onMenu();
    }, 200);
  };

  const cancelEditHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    holdProgress.stopAnimation();
    holdProgress.setValue(0);
  };

  const holdFillWidth = holdProgress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={localStyles.headerRow}>
      <TouchableOpacity onPress={onBack} style={localStyles.headerButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <IconSymbol name="chevron.left" size={18} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity onPressIn={startEditHold} onPressOut={cancelEditHold} style={localStyles.editButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Hold to edit tank">
        <AnimatedFill style={[localStyles.editButtonFill, { width: holdFillWidth }]} />
        <IconSymbol name="pencil" size={18} color="#FFFFFF" />
        <Text style={localStyles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
}

const localStyles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    marginTop: 8,
    marginBottom: 24,
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    minWidth: 78,
    height: 36,
    position: 'absolute',
    right: 0,
    top: 48,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  editButtonFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(46, 140, 166, 0.8)',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
