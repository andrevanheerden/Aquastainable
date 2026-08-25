import { useCallback, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

export type FishSpecies = {
  id: string;
  name: string;
  FBname: string;
  scientificName: string;
  imageName?: string;
  image: string;
  imageSourceUrl?: string;
  imageLicense?: string;
  source?: string;
  schoolSize: string;
  tempC: string;
  pH: string;
  fishId?: string;
  description?: string;
  bestTempC?: string;
  phRange?: string;
  waterSpace?: string;
  feedType?: string;
  feeding?: string;
  summary?: string;
  speciesName?: string;
  origin?: string;
  lifespan?: string;
  preferredTempC?: string;
  adultLengthCm?: number | null;
  temperament?: string;
  minimumGroupSize?: number | null;
  careProfileConfidence?: string;
  careProfileModel?: string;
};

export type TankFish = FishSpecies & {
  fishId: string;
  tankId: string;
  tankName?: string;
  addedAt?: string;
};

export type IndividualFish = {
  id: string;
  parentFishId: string;
  tankId: string;
  imageUrl: string;
  name: string;
  age: string;
  health: string;
  story: string;
  schoolStatus: 'new' | 'existing';
  createdAt?: string;
  updatedAt?: string;
};

export type FishCompatibilityAssessment = {
  canAdd: boolean;
  status: 'compatible' | 'incompatible' | 'needs_information';
  title: string;
  explanation: string;
  optimalSchoolSize: string;
  maximumSchoolSize: string;
  selectedTankId: string;
  selectedTankName: string;
  suggestedTankId: string | null;
  suggestedTankName: string;
};

export function useFishApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestApi = useCallback(async <T,>(method: 'get' | 'post' | 'patch' | 'delete', path: string, payload?: object) => {
    setError('');
    setLoading(true);

    try {
      const response = await axios({
        method,
        url: `${API_BASE_URL}${path}`,
        data: payload,
      });

      return response.data as T;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error
          ? err.message
          : 'Request failed.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchFish = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        return [];
      }

      return await requestApi<FishSpecies[]>('get', `/fish/search?query=${encodeURIComponent(trimmedQuery)}`);
    },
    [requestApi]
  );

  const addFishToTank = useCallback(
    async (userId: string, tankId: string, fishId: string, schoolSize: string, fishData?: { name?: string; scientificName?: string; imageName?: string; image?: string; imageSourceUrl?: string; imageLicense?: string; source?: string }) => {
      return requestApi<TankFish>('post', '/fish/add', {
        userId,
        tankId,
        fishId,
        schoolSize,
        name: fishData?.name,
        scientificName: fishData?.scientificName,
        imageName: fishData?.imageName,
        image: fishData?.image,
        imageSourceUrl: fishData?.imageSourceUrl,
        imageLicense: fishData?.imageLicense,
        source: fishData?.source,
      });
    },
    [requestApi]
  );

  const assessFishAddition = useCallback(async (payload: {
    userId: string;
    tankId: string;
    fishId: string;
    schoolSize: string;
    name?: string;
    scientificName?: string;
  }) => {
    return requestApi<FishCompatibilityAssessment>('post', '/fish/assess-add', payload);
  }, [requestApi]);

  const addReviewedFish = useCallback(async (payload: {
    userId: string;
    tankId: string;
    fishId: string;
    schoolSize: string;
    name?: string;
    scientificName?: string;
    imageName?: string;
    image?: string;
    imageSourceUrl?: string;
    imageLicense?: string;
    source?: string;
    assessment?: FishCompatibilityAssessment;
  }) => {
    return requestApi<TankFish & { assessment: FishCompatibilityAssessment }>('post', '/fish/add-reviewed', payload);
  }, [requestApi]);

  const getTankFish = useCallback(async (tankId: string) => {
    return requestApi<TankFish[]>('get', `/fish/tank/${tankId}`);
  }, [requestApi]);

  const getUserFish = useCallback(async (userId: string) => {
    return requestApi<TankFish[]>('get', `/fish/user/${userId}`);
  }, [requestApi]);

  const updateFish = useCallback(async (userId: string, tankId: string, fishDocId: string, schoolSize: string) => {
    return requestApi<TankFish>('patch', `/fish/${encodeURIComponent(tankId)}/${encodeURIComponent(fishDocId)}`, { userId, schoolSize });
  }, [requestApi]);

  const enrichFish = useCallback(async (userId: string, fishId: string) => {
    return requestApi<{ updated: number; description?: string; bestTempC?: string; phRange?: string; waterSpace?: string; feedType?: string }>(
      'post',
      `/fish/enrich/${encodeURIComponent(fishId)}`,
      { userId },
    );
  }, [requestApi]);

  const getIndividualFish = useCallback(async (userId: string, tankId: string, fishDocId: string) => {
    return requestApi<IndividualFish[]>('get', `/fish/${encodeURIComponent(tankId)}/${encodeURIComponent(fishDocId)}/individual-fish?userId=${encodeURIComponent(userId)}`);
  }, [requestApi]);

  const addIndividualFish = useCallback(async (userId: string, tankId: string, fishDocId: string, payload: Omit<IndividualFish, 'id' | 'parentFishId' | 'tankId' | 'imageUrl' | 'createdAt' | 'updatedAt'> & { image: string }) => {
    return requestApi<IndividualFish & { parentSchoolSize: string }>('post', `/fish/${encodeURIComponent(tankId)}/${encodeURIComponent(fishDocId)}/individual-fish`, { userId, ...payload });
  }, [requestApi]);

  const updateIndividualFish = useCallback(async (userId: string, tankId: string, fishDocId: string, individualFishId: string, payload: Partial<Pick<IndividualFish, 'name' | 'age' | 'health' | 'schoolStatus'>> & { story?: string; image?: string }) => {
    return requestApi<IndividualFish>('patch', `/fish/${encodeURIComponent(tankId)}/${encodeURIComponent(fishDocId)}/individual-fish/${encodeURIComponent(individualFishId)}`, { userId, ...payload });
  }, [requestApi]);

  const deleteIndividualFish = useCallback(async (userId: string, tankId: string, fishDocId: string, individualFishId: string) => {
    return requestApi<{ success: boolean }>('delete', `/fish/${encodeURIComponent(tankId)}/${encodeURIComponent(fishDocId)}/individual-fish/${encodeURIComponent(individualFishId)}`, { userId });
  }, [requestApi]);

  const removeFishFromTank = useCallback(
    async (userId: string, tankId: string, fishDocId: string) => {
      return requestApi<{ success: boolean }>('delete', `/fish/${tankId}/${fishDocId}`, { userId });
    },
    [requestApi]
  );

  const clearError = useCallback(() => setError(''), []);

  return { loading, error, clearError, searchFish, addFishToTank, assessFishAddition, addReviewedFish, getTankFish, getUserFish, updateFish, enrichFish, getIndividualFish, addIndividualFish, updateIndividualFish, deleteIndividualFish, removeFishFromTank };
}

export default useFishApi;
