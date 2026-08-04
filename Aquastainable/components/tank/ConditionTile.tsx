import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

type Props = {
  label: string;
  value: string;
  iconName?: string;
  accentColor?: string;
  imageSource?: any;
  imageSize?: number;
  tileHeight?: number;
};

export default function ConditionTile({
  label,
  value,
  iconName,
  accentColor = '#8A7CFF',
  imageSource,
  imageSize,
  tileHeight,
}: Props) {
  const tileStyle = [localStyles.conditionTile, tileHeight ? { height: tileHeight } : null];

  return (
    <View style={tileStyle}>
      <Text style={localStyles.conditionTileLabel}>{label}</Text>
      <View style={localStyles.conditionIconContainer}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={[
              localStyles.conditionIconImage,
              imageSize ? { width: imageSize, height: imageSize } : null,
            ]}
          />
        ) : (
          <IconSymbol name={iconName ?? 'question'} size={36} color={accentColor} />
        )}
      </View>
      <Text style={localStyles.conditionTileValue}>{value}</Text>
    </View>
  );
}

const localStyles = StyleSheet.create({
  conditionTile: {
    width: 160,
    height: 200,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  conditionTileLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  conditionIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  conditionIconImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  conditionTileValue: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
