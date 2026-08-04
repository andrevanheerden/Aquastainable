import React, { useMemo, useState } from 'react';
import { Modal, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TANKS = ['Main Tank', 'Betta Tank', 'Plant Tank'];
const SPECIES = ['Fish', 'Plants'];

export default function ActionToggles() {
  const [tankModalVisible, setTankModalVisible] = useState(false);
  const [speciesModalVisible, setSpeciesModalVisible] = useState(false);
  const [selectedTanks, setSelectedTanks] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);

  const selectedTankLabel = useMemo(() => {
    if (selectedTanks.length === 0) {
      return 'Select Tanks';
    }

    if (selectedTanks.length === 1) {
      return selectedTanks[0];
    }

    return `${selectedTanks[0]} +${selectedTanks.length - 1}`;
  }, [selectedTanks]);
  const speciesLabel = useMemo(() => {
    if (selectedSpecies.length === 0) {
      return 'Select Species';
    }

    if (selectedSpecies.length === 1) {
      return selectedSpecies[0];
    }

    return `${selectedSpecies[0]} +${selectedSpecies.length - 1}`;
  }, [selectedSpecies]);

  const toggleTank = (tank: string) => {
    setSelectedTanks((current) => {
      if (current.includes(tank)) {
        return current.filter((item) => item !== tank);
      }
      return [...current, tank];
    });
  };

  const toggleSpecies = (species: string) => {
    setSelectedSpecies((current) => {
      if (current.includes(species)) {
        return current.filter((item) => item !== species);
      }
      return [...current, species];
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.toggleButton} onPress={() => setTankModalVisible(true)}>
        <Ionicons name="cube-outline" size={16} color="rgba(255,255,255,0.7)" />
        <Text style={styles.toggleText}>{selectedTankLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.toggleButton} onPress={() => setSpeciesModalVisible(true)}>
        <Ionicons name="leaf-outline" size={16} color="rgba(255,255,255,0.7)" />
        <Text style={styles.toggleText}>{speciesLabel}</Text>
      </TouchableOpacity>

      <Modal transparent visible={tankModalVisible} animationType="fade" onRequestClose={() => setTankModalVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setTankModalVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose tank</Text>
            <View style={styles.pillGrid}>
              {TANKS.map((tank) => {
                const isSelected = selectedTanks.includes(tank);
                return (
                  <TouchableOpacity
                    key={tank}
                    style={[styles.optionPill, isSelected && styles.selectedOptionPill]}
                    onPress={() => toggleTank(tank)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>{tank}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent visible={speciesModalVisible} animationType="fade" onRequestClose={() => setSpeciesModalVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSpeciesModalVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose species</Text>
            <View style={styles.pillGrid}>
              {SPECIES.map((species) => {
                const isSelected = selectedSpecies.includes(species);
                return (
                  <TouchableOpacity
                    key={species}
                    style={[styles.optionPill, isSelected && styles.selectedOptionPill]}
                    onPress={() => toggleSpecies(species)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>{species}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
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
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#16151A',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  selectedOptionPill: {
    backgroundColor: '#2E8CA6',
    borderColor: '#2E8CA6',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
});