import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeType } from '../../types/theme';

interface PillItem {
  id: string;
  label: string;
  theme: ThemeType;
  iconName: string;
  iconType: 'ion' | 'material';
}

interface SuggestionPillsProps {
  activeTheme: ThemeType;
  onSelectPill: (theme: ThemeType) => void;
}

const PILLS: PillItem[] = [
  {
    id: 'sickness',
    label: 'Fish Sickness & Problems',
    theme: 'crimson',
    iconName: 'medical-bag',
    iconType: 'material',
  },
  {
    id: 'water',
    label: 'Water Test',
    theme: 'emerald',
    iconName: 'water-outline',
    iconType: 'ion',
  },
  {
    id: 'tank',
    label: 'Tank Questions',
    theme: 'midnight',
    iconName: 'fishbowls',
    iconType: 'material',
  },
  {
    id: 'fish',
    label: 'Fish Questions',
    theme: 'default',
    iconName: 'fish-outline',
    iconType: 'ion',
  },
];

export default function SuggestionPills({ activeTheme, onSelectPill }: SuggestionPillsProps) {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {PILLS.map((pill) => {
          const isActive = activeTheme === pill.theme;
          return (
            <TouchableOpacity
              key={pill.id}
              style={[styles.pill, isActive && styles.activePill]}
              onPress={() => onSelectPill(pill.theme)}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrapper}>
                {pill.iconType === 'ion' ? (
                  <Ionicons name={pill.iconName as any} size={18} color="#C084FC" />
                ) : (
                  <MaterialCommunityIcons name={pill.iconName as any} size={18} color="#C084FC" />
                )}
              </View>
              <Text style={styles.pillText}>{pill.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  activePill: {
    borderColor: '#A855F7',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  iconWrapper: {
    marginRight: 8,
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});