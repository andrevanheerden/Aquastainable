import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

export default function ActionToggles() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.toggleButton}>
        <Ionicons name="sparkles-outline" size={16} color="rgba(255,255,255,0.7)" />
        <Text style={styles.toggleText}>Deep Think (R1)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.toggleButton}>
        <Feather name="globe" size={16} color="rgba(255,255,255,0.7)" />
        <Text style={styles.toggleText}>Search</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 12,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  toggleText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
});