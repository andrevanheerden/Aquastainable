import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import SwipeCheckButton from './SwipeCheckButton';
import CompatibilityResultModal from './CompatibilityResultModal';
import { useFishApi, FishSpecies } from '../../app/hooks/useFishApi';
import { FishCompatibilityAssessment } from '../../app/hooks/useFishApi';
import { auth } from '@/firebase';
import { useTankApi, TankRecord } from '../../app/hooks/useTankApi';

type Props = {
  visible: boolean;
  onClose: () => void;
  tankId?: string;
};

export default function AddFishModal({ visible, onClose, tankId: defaultTankId }: Props) {
  const { searchFish, assessFishAddition, addReviewedFish, loading: apiLoading } = useFishApi();
  const { getUserTanks } = useTankApi();
  const [speciesQuery, setSpeciesQuery] = useState('');
  const [selectedFish, setSelectedFish] = useState<FishSpecies | null>(null);
  const [fishSuggestions, setFishSuggestions] = useState<FishSpecies[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedTank, setSelectedTank] = useState<string | null>(defaultTankId || null);
  const [schoolSize, setSchoolSize] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [addingFish, setAddingFish] = useState(false);
  const [tanks, setTanks] = useState<TankRecord[]>([]);
  const [assessment, setAssessment] = useState<FishCompatibilityAssessment | null>(null);
  const [compatibilityVisible, setCompatibilityVisible] = useState(false);
  const [checkingCompatibility, setCheckingCompatibility] = useState(false);

  // Get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user?.uid ?? null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      setTanks([]);
      setSelectedTank(null);
      return;
    }

    getUserTanks(currentUserId)
      .then((userTanks) => {
        const nextTanks = Array.isArray(userTanks) ? userTanks : [];
        setTanks(nextTanks);
        setSelectedTank(defaultTankId && nextTanks.some((tank) => tank.tankId === defaultTankId)
          ? defaultTankId
          : nextTanks[0]?.tankId ?? null);
      })
      .catch(() => setTanks([]));
  }, [currentUserId, defaultTankId, getUserTanks]);

  // Search fish whenever the user types, so suggestions update with each letter.
  useEffect(() => {
    const trimmedQuery = speciesQuery.trim();

    if (!trimmedQuery) {
      setFishSuggestions([]);
      setShowSuggestions(false);
      setSearchError('');
      setSearchLoading(false);
      return;
    }

    const searchAsync = async () => {
      setSearchLoading(true);
      try {
        const results = await searchFish(trimmedQuery);
        const nextResults = Array.isArray(results) ? results : [];
        setFishSuggestions(nextResults);
        setShowSuggestions(nextResults.length > 0);
        setSearchError('');
      } catch (error) {
        console.error('Search error:', error);
        setFishSuggestions([]);
        setShowSuggestions(false);
        setSearchError(error instanceof Error ? error.message : 'Fish species search is unavailable.');
      } finally {
        setSearchLoading(false);
      }
    };

    searchAsync();
  }, [speciesQuery, searchFish]);

  const handleSelectFish = (fish: FishSpecies) => {
    setSelectedFish(fish);
    setSpeciesQuery(fish.FBname || fish.name);
    setImageLoading(false);
    setShowSuggestions(false);
    setFishSuggestions([]);
  };

  const handleClearSelection = () => {
    setSelectedFish(null);
    setSpeciesQuery('');
    setSchoolSize('');
    setFishSuggestions([]);
    setShowSuggestions(false);
    setImageLoading(false);
    setAssessment(null);
  };

  const getFishPayload = (targetTankId: string) => ({
    userId: currentUserId as string,
    tankId: targetTankId,
    fishId: selectedFish?.id as string,
    schoolSize: schoolSize.trim(),
    name: selectedFish?.name,
    scientificName: selectedFish?.scientificName,
    imageName: selectedFish?.imageName,
    image: selectedFish?.image,
    imageSourceUrl: selectedFish?.imageSourceUrl,
    imageLicense: selectedFish?.imageLicense,
    source: selectedFish?.source,
  });

  const handleCheckCompatibility = async () => {
    if (!selectedFish || !selectedTank || !currentUserId) {
      Alert.alert('Missing information', 'Please select a fish, tank, and ensure you are logged in.');
      return;
    }

    if (!schoolSize.trim()) {
      Alert.alert('Missing school size', 'Please enter the school size for this fish.');
      return;
    }

    try {
      setCheckingCompatibility(true);
      const result = await assessFishAddition(getFishPayload(selectedTank));
      setAssessment(result);
      setCompatibilityVisible(true);
    } catch (error) {
      Alert.alert('Compatibility check failed', error instanceof Error ? error.message : 'Unable to review this fish.');
    } finally {
      setCheckingCompatibility(false);
    }
  };

  const handleAdd = async (targetTankId = selectedTank) => {
    if (!selectedFish || !targetTankId || !currentUserId) {
      return;
    }

    try {
      setAddingFish(true);
      await addReviewedFish(getFishPayload(targetTankId));

      Alert.alert('Success', `${selectedFish.name} has been added to your tank!`);
      
      // Reset form
      setSelectedFish(null);
      setSpeciesQuery('');
      setSelectedTank(defaultTankId || null);
      setSchoolSize('');
      setFishSuggestions([]);
      setAssessment(null);
      setCompatibilityVisible(false);
      
      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add fish.');
    } finally {
      setAddingFish(false);
    }
  };

  const handleAssignSuggestedTank = () => {
    if (assessment?.suggestedTankId) {
      setSelectedTank(assessment.suggestedTankId);
      setCompatibilityVisible(false);
      handleAdd(assessment.suggestedTankId);
    }
  };

  const handleUseOptimalSchoolSize = () => {
    if (assessment?.optimalSchoolSize) {
      setSchoolSize(assessment.optimalSchoolSize);
      setCompatibilityVisible(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.screenBackdrop}>
        <TouchableOpacity style={styles.backdropTouchable} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalCard}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>Add new fish</Text>
                <Text style={styles.subtitle}>Search a species, and assign to your tank.</Text>
              </View>
              <TouchableOpacity style={styles.closeIconButton} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Fish Image Preview */}
            {selectedFish ? (
              <View style={styles.imageContainer}>
                {selectedFish.image ? (
                  <Image
                    source={{ uri: selectedFish.image }}
                    style={styles.photoPreview}
                    resizeMode="cover"
                    onLoad={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                  />
                ) : (
                  <View style={styles.imageEmpty}>
                    <Text style={styles.imageEmptyText}>No image available</Text>
                  </View>
                )}
                {imageLoading ? (
                  <View style={styles.imageLoadingOverlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.imageLoadingText}>Loading image...</Text>
                  </View>
                ) : null}
                <TouchableOpacity style={styles.clearButton} onPress={handleClearSelection}>
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imageEmpty}>
                <Text style={styles.imageEmptyText}>Select a fish to see image</Text>
              </View>
            )}

            {/* Species Search */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Species Name</Text>
              <TextInput
                value={speciesQuery}
                onChangeText={(text) => {
                  setSpeciesQuery(text);
                  if (selectedFish && text.trim() !== selectedFish.name.trim()) {
                    setSelectedFish(null);
                    setImageLoading(false);
                  }
                }}
                placeholder="Search for a fish (e.g., Guppy, Neon Tetra)"
                placeholderTextColor="#6E7684"
                style={styles.input}
              />
              <Text style={styles.helperText}>Start typing to search freshwater aquarium fish species.</Text>
              {searchLoading ? (
                <View style={styles.searchLoadingRow}>
                  <ActivityIndicator size="small" color="#5B8CFF" />
                  <Text style={styles.searchLoadingText}>Searching fish species...</Text>
                </View>
              ) : null}

              {/* Fish Suggestions */}
              {showSuggestions && fishSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {fishSuggestions.map((fish) => (
                    <TouchableOpacity
                      key={fish.id}
                      style={styles.suggestionItem}
                      onPress={() => handleSelectFish(fish)}
                    >
                      {fish.image ? (
                        <Image source={{ uri: fish.image }} style={styles.suggestionImage} />
                      ) : null}
                      <View style={styles.suggestionContent}>
                        <Text style={styles.suggestionName}>{fish.FBname || fish.name}</Text>
                        {fish.scientificName ? <Text style={styles.suggestionScientific}>{fish.scientificName}</Text> : null}
                        {fish.schoolSize ? <Text style={styles.suggestionSchool}>School: {fish.schoolSize}</Text> : null}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {speciesQuery.trim().length > 0 && !searchLoading && !apiLoading && fishSuggestions.length === 0 && (
                <Text style={styles.noResultsText}>{searchError || 'No fish found for that search.'}</Text>
              )}
            </View>

            {/* Tank Selection */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Tank</Text>
              <View style={styles.tankRow}>
                {tanks.map((tank) => (
                  <TouchableOpacity
                    key={tank.tankId}
                    style={[styles.tankOption, selectedTank === tank.tankId && styles.tankOptionActive]}
                    onPress={() => setSelectedTank(tank.tankId)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tankLabel, selectedTank === tank.tankId && styles.tankLabelActive]}>
                      {tank.tankName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* School Size */}
            {selectedFish && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>School Size</Text>
                <TextInput
                  value={schoolSize}
                  onChangeText={setSchoolSize}
                  placeholder="Example: 6+ recommended"
                  placeholderTextColor="#6E7684"
                  style={styles.input}
                />
              </View>
            )}

            {/* Add action */}
            {selectedFish && (
              <>
                <View style={styles.divider} />
                <SwipeCheckButton
                  label="Swipe to check compatibility"
                  onSwipe={handleCheckCompatibility}
                  disabled={apiLoading || addingFish || checkingCompatibility || !schoolSize.trim()}
                />
              </>
            )}
          </ScrollView>
        </View>
        <CompatibilityResultModal
          visible={compatibilityVisible}
          analysis={assessment}
          typeLabel="fish"
          onClose={() => setCompatibilityVisible(false)}
          onSwipeToAdd={() => handleAdd()}
          onAssignSuggested={handleAssignSuggestedTank}
          onUseOptimalSchoolSize={handleUseOptimalSchoolSize}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screenBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 12, 21, 0.65)',
    justifyContent: 'center',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    marginHorizontal: 18,
    borderRadius: 28,
    backgroundColor: '#16151A',
    maxHeight: '86%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  content: {
    padding: 22,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  closeIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1B1D26',
    alignItems: 'center',
    justifyContent: 'center',
    right: 0,
    top: -10,
  },
  closeIcon: {
    color: '#B3B9C9',
    fontSize: 20,
    fontWeight: '700',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#8F97A6',
    fontSize: 14,
    marginBottom: 0,
  },
  imagePicker: {
    height: 148,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#15181F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  imageText: {
    color: '#B3B9C9',
    fontSize: 15,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  field: {
    marginBottom: 18,
  },
  fieldLabel: {
    color: '#D0D7E4',
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    height: 48,
    borderRadius: 16,
    backgroundColor: '#14151B',
    color: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  helperText: {
    marginTop: 8,
    color: '#7B869E',
    fontSize: 12,
    lineHeight: 16,
  },
  searchLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  searchLoadingText: {
    color: '#AEB7C8',
    fontSize: 12,
  },
  tankRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tankOption: {
    flex: 1,
    minWidth: '30%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#14151B',
  },
  tankOptionActive: {
    borderColor: '#5B8CFF',
    backgroundColor: '#18234F',
  },
  tankLabel: {
    color: '#CED5E3',
    fontSize: 12,
    fontWeight: '600',
  },
  tankLabelActive: {
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 20,
  },
  sectionLabel: {
    color: '#B3B9C9',
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
  },
  analysisBox: {
    borderRadius: 22,
    backgroundColor: '#14151B',
    padding: 18,
  },
  analysisTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  analysisTitleWarning: {
    color: '#FF7A7A',
  },
  analysisText: {
    color: '#B3B9C9',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#5B8CFF',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  actionButtonDisabled: {
    backgroundColor: '#3A4258',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 18,
  },
  imageEmpty: {
    height: 180,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#1B1F28',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  imageEmptyText: {
    color: '#7B869E',
    fontSize: 14,
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 15, 23, 0.58)',
    gap: 8,
  },
  imageLoadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  clearButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  noResultsText: {
    marginTop: 8,
    color: '#8F97A6',
    fontSize: 12,
  },
  suggestionsContainer: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: '#1B1F28',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    maxHeight: 5 * 44,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  suggestionImage: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: '#14151B',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 1,
  },
  suggestionScientific: {
    color: '#8F97A6',
    fontSize: 10,
    fontStyle: 'italic',
    marginBottom: 1,
  },
  suggestionSchool: {
    color: '#7B869E',
    fontSize: 10,
  },
});
