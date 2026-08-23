import React, { useEffect, useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';

import FishLogCard from './FishLogCard';
import AddNewFishCard from './AddNewFishCard';
import AddSchoolFishModal, { FishRecord } from './AddSchoolFishModal';
import { IndividualFish, useFishApi } from '../../app/hooks/useFishApi';

type Props = {
  userId: string;
  tankId: string;
  fishDocId: string;
  onParentSchoolSizeChange: (schoolSize: string) => void;
};

function toFishRecord(fish: IndividualFish): FishRecord {
  return {
    id: fish.id,
    name: fish.name,
    age: fish.age,
    health: fish.health,
    description: fish.story,
    schoolStatus: fish.schoolStatus,
    image: { uri: fish.imageUrl },
  };
}

async function imageUriToDataUri(uri: string) {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function FishLogGrid({ userId, tankId, fishDocId, onParentSchoolSizeChange }: Props) {
  const { getIndividualFish, addIndividualFish } = useFishApi();
  const [fishRecords, setFishRecords] = useState<FishRecord[]>([]);
  const [isAddFishVisible, setIsAddFishVisible] = useState(false);

  useEffect(() => {
    if (!userId || !tankId || !fishDocId) {
      setFishRecords([]);
      return;
    }

    getIndividualFish(userId, tankId, fishDocId)
      .then((fish) => setFishRecords(Array.isArray(fish) ? fish.map(toFishRecord) : []))
      .catch(() => setFishRecords([]));
  }, [fishDocId, getIndividualFish, tankId, userId]);

  const handleSave = async (fish: FishRecord) => {
    try {
      const image = typeof fish.image === 'object' && 'uri' in fish.image
        ? await imageUriToDataUri(fish.image.uri)
        : '';
      const savedFish = await addIndividualFish(userId, tankId, fishDocId, {
        image,
        name: fish.name,
        age: fish.age,
        health: fish.health,
        story: fish.description,
        schoolStatus: fish.schoolStatus,
      });
      setFishRecords((currentFish) => [...currentFish, toFishRecord(savedFish)]);
      onParentSchoolSizeChange(savedFish.parentSchoolSize);
    } catch (error) {
      Alert.alert('Unable to add fish', error instanceof Error ? error.message : 'The fish could not be saved.');
    }
  };

  return (
    <View style={styles.grid}>
      {fishRecords.map((fish) => (
        <FishLogCard key={fish.id} name={fish.name} age={fish.age} health={fish.health} description={fish.description} image={fish.image} />
      ))}
      <AddNewFishCard onPress={() => setIsAddFishVisible(true)} />
      <AddSchoolFishModal
        visible={isAddFishVisible}
        onClose={() => setIsAddFishVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});
