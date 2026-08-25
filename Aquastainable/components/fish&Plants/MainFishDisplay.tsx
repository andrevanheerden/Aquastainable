import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type Props = {
  image?: number | { uri: string };
  title: string;
  subtitle?: string;
  origin?: string;
  lifespan?: string;
  preferredTempC?: string;
  tankName?: string;
  phLevel?: string;
  feeding?: string;
};

export default function MainFishDisplay({ image, title, subtitle, origin, lifespan, preferredTempC, tankName, phLevel, feeding }: Props) {
  return (
    <View style={styles.container}>
      {image ? <Image source={image} style={styles.image} resizeMode="cover" /> : <View style={styles.imageEmpty} />}
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        {(origin || lifespan || preferredTempC || tankName || phLevel || feeding) && (
          <View style={styles.dataGrid}>
            {origin ? (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Origin</Text>
                <Text style={styles.dataValue}>{origin}</Text>
              </View>
            ) : null}
            {lifespan ? (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Lifespan</Text>
                <Text style={styles.dataValue}>{lifespan}</Text>
              </View>
            ) : null}
            {preferredTempC ? (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Preferred temp</Text>
                <Text style={styles.dataValue}>{preferredTempC}</Text>
              </View>
            ) : null}
            {tankName ? (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Tank</Text>
                <Text style={styles.dataValue}>{tankName}</Text>
              </View>
            ) : null}
            {phLevel ? (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>pH level</Text>
                <Text style={styles.dataValue}>{phLevel}</Text>
              </View>
            ) : null}
            {feeding ? (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Feed type</Text>
                <Text style={styles.dataValue}>{feeding}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: 450,
    marginHorizontal: 0,
    alignSelf: 'stretch',
    borderRadius: 0,
  },
  imageEmpty: {
    width: '100%',
    height: 450,
    backgroundColor: '#20232C',
  },
  textBlock: {
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#ABB3C2',
    fontSize: 14,
    lineHeight: 20,
  },
  dataGrid: {
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: 12,
    marginTop: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dataLabel: {
    color: '#6E6E73',
    fontSize: 13,
  },
  dataValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
});
