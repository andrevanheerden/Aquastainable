import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

type Props = {
  onBack: () => void;
  onMenu: () => void;
};

export default function HeaderRow({ onBack, onMenu }: Props) {
  return (
    <View style={localStyles.headerRow}>
      <TouchableOpacity onPress={onBack} style={localStyles.headerButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <IconSymbol name="chevron.left" size={18} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity onPress={onMenu} style={localStyles.headerButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <IconSymbol name="pencil" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const localStyles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});
