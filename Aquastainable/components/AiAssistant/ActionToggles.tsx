import React, { useMemo, useState } from 'react';
import { Modal, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Option = { id: string; label: string; kind: 'tank' | 'fish' | 'plant' };

type Props = {
  tanks: Option[];
  species: Option[];
  onSelectionChange: (selection: { tankIds: string[]; speciesIds: string[] }) => void;
};

export default function ActionToggles({ tanks, species, onSelectionChange }: Props) {
  const [tankModalVisible, setTankModalVisible] = useState(false);
  const [speciesModalVisible, setSpeciesModalVisible] = useState(false);
  const [selectedTanks, setSelectedTanks] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);

  const selectedTankLabel = useMemo(() => {
    if (selectedTanks.length === 0) {
      return 'Select Tanks';
    }

    if (selectedTanks.length === 1) {
      return tanks.find((tank) => tank.id === selectedTanks[0])?.label || 'Select Tanks';
    }

    return `${tanks.find((tank) => tank.id === selectedTanks[0])?.label || 'Tank'} +${selectedTanks.length - 1}`;
  }, [selectedTanks, tanks]);
  const speciesLabel = useMemo(() => {
    if (selectedSpecies.length === 0) {
      return 'Select Species';
    }

    if (selectedSpecies.length === 1) {
      return species.find((item) => item.id === selectedSpecies[0])?.label || 'Select Species';
    }

    return `${species.find((item) => item.id === selectedSpecies[0])?.label || 'Species'} +${selectedSpecies.length - 1}`;
  }, [selectedSpecies, species]);

  const toggleTank = (tank: string) => {
    setSelectedTanks((current) => {
      if (current.includes(tank)) {
        const next = current.filter((item) => item !== tank);
        onSelectionChange({ tankIds: next, speciesIds: selectedSpecies });
        return next;
      }
      const next = [...current, tank];
      onSelectionChange({ tankIds: next, speciesIds: selectedSpecies });
      return next;
    });
  };

  const toggleSpecies = (species: string) => {
    setSelectedSpecies((current) => {
      if (current.includes(species)) {
        const next = current.filter((item) => item !== species);
        onSelectionChange({ tankIds: selectedTanks, speciesIds: next });
        return next;
      }
        const next = [...current, species];
        onSelectionChange({ tankIds: selectedTanks, speciesIds: next });
        return next;
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
              {tanks.map((tank) => {
                const isSelected = selectedTanks.includes(tank.id);
                return (
                  <TouchableOpacity
                    key={tank.id}
                    style={[styles.optionPill, isSelected && styles.selectedOptionPill]}
                    onPress={() => toggleTank(tank.id)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>{tank.label}</Text>
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
              {species.map((speciesOption) => {
                const isSelected = selectedSpecies.includes(speciesOption.id);
                return (
                  <TouchableOpacity
                    key={speciesOption.id}
                    style={[styles.optionPill, isSelected && styles.selectedOptionPill]}
                    onPress={() => toggleSpecies(speciesOption.id)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>{speciesOption.label}</Text>
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