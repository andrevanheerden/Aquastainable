import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
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
  const { preferredTempC, ph, lastTestedDaysAgo, ammoniaPpm, nitritePpm } = conditions as any;

  const tankSize = 'Min. 10L';
  const waterChangeInterval = 'Weekly';
  const bioload = (parseFloat(ammoniaPpm) > 0 || parseFloat(nitritePpm) > 0) ? 'Medium' : 'Low';
  const nextWaterChange = lastTestedDaysAgo > 6 ? 'Due' : `${7 - lastTestedDaysAgo}d`;

  return (
    <>
      <View style={localStyles.titleRow}>
        <Text style={localStyles.sectionTitle}>Aquarium Care</Text>
      </View>
      <View style={localStyles.conditionsGrid}>
        <ConditionTile
          label="Tank Temp"
          value={preferredTempC}
          valueOnTop
          tileHeight={130}
          imageSource={require('../../assets/icons/temp.png')}
        />

        <ConditionTile
          label="pH Level"
          value={ph}
          valueOnTop
          tileHeight={130}
          imageSource={require('../../assets/icons/PH.png')}
        />

        <ConditionTile
          label="Tank Size"
          value={tankSize}
          valueOnTop
          tileHeight={130}
          imageSource={require('../../assets/icons/tank.png')}
        />

        <ConditionTile
          label="Water Change"
          value={waterChangeInterval}
          valueOnTop
          tileHeight={130}
          imageSource={require('../../assets/icons/water.png')}
        />

        <ConditionTile
          label="Bioload"
          value={bioload}
          valueOnTop
          tileHeight={130}
          imageSource={require('../../assets/icons/bio.png')}
        />

        <ConditionTile
          label="Next Change"
          value={nextWaterChange}
          valueOnTop
          tileHeight={130}
          imageSource={require('../../assets/icons/date.png')}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  titleIcon: {
    width: 28,
    height: 28,
    marginRight: 10,
    resizeMode: 'contain',
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
