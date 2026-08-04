import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ConditionTile from './ConditionTile';

type Conditions = {
  preferredTempC: number;
  waterQuality: string;
  ph: string | number;
  lastTestedDaysAgo: number;
};

type Props = {
  conditions: Conditions;
};

export default function NeedToKnow({ conditions }: Props) {
  return (
    <>
      <Text style={localStyles.sectionTitle}>Need to know</Text>
      <View style={localStyles.conditionsGrid}>
        <ConditionTile
          label="Water temp"
          value={`${conditions.preferredTempC}°C - Medium`}
          imageSource={require('../../assets/icons/temp.png')}
          imageSize={150}
        />
        <ConditionTile
          label="Living Area"
          value={conditions.waterQuality}
          imageSource={require('../../assets/icons/plant.png')}
          imageSize={150}
        />
        <ConditionTile
          label="pH Level"
          value={conditions.ph}
          imageSource={require('../../assets/icons/PH.png')}
          imageSize={150}
        />
        <ConditionTile
          label="Last tested"
          value={conditions.lastTestedDaysAgo === 0 ? 'Today' : `${conditions.lastTestedDaysAgo}d ago`}
          imageSource={require('../../assets/icons/date.png')}
          imageSize={150}
        />
      </View>
    </>
  );
}

const localStyles = StyleSheet.create({
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
