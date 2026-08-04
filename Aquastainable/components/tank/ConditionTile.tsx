import React, { useState } from 'react';
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
  valueOnTop?: boolean;
};

export default function ConditionTile({
  label,
  value,
  iconName,
  accentColor = '#8A7CFF',
  imageSource,
  imageSize,
  tileHeight,
  valueOnTop = false,
}: Props) {
  const tileStyle = [
    localStyles.conditionTile,
    valueOnTop ? { alignItems: 'flex-start' } : null,
    tileHeight ? { height: tileHeight } : null,
  ];

  if (valueOnTop) {
    const [imageVisible, setImageVisible] = useState(true);

    return (
      <View style={tileStyle}>
        <View style={localStyles.valueRow}>
          {imageSource && imageVisible ? (
            <Image
              source={imageSource}
              style={localStyles.valueRowIcon}
              onError={() => setImageVisible(false)}
            />
          ) : imageSource && !imageVisible ? (
            <IconSymbol name={iconName ?? 'question'} size={36} color={accentColor} />
          ) : null}

          <View style={localStyles.valueColumn}>
            <Text style={localStyles.conditionTileValueTop}>{value}</Text>
            <Text style={localStyles.conditionTileLabelBelow}>{label}</Text>
          </View>
        </View>
      </View>
    );
  }

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
            onError={() => {}}
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
    width: 180,
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
  conditionTileValueTop: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'left',
    marginBottom: 6,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  valueRowIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
    resizeMode: 'contain',
  },
  valueColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  conditionTileLabelBelow: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'left',
  },
});
