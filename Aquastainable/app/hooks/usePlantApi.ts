import { useCallback, useState } from 'react';
import axios, { isAxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:4000';

export type PlantSpecies = {
  id: string;
  name: string;
  scientificName: string;
  image: string;
  imageSourceUrl?: string;
  imageLicense?: string;
  source?: string;
};

export type SavedPlant = PlantSpecies & {
  plantId: string;
  tankId: string;
  tankName?: string;
  addedAt?: string;
  description?: string;
  bestTempC?: string;
  phRange?: string;
  light?: string;
  growthRate?: string;
  placement?: string;
  careProfileConfidence?: string;
  careProfileModel?: string;
};

export type PlantCompatibilityAssessment = {
  canAdd: boolean;
  status: 'compatible' | 'incompatible' | 'needs_information';
  title: string;
  explanation: string;
  suggestedPlantName: string;
  model?: string;
};

export function usePlantApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestApi = useCallback(async <T,>(method: 'get' | 'post', path: string, payload?: object) => {
    setError('');
    setLoading(true);
    try {
      const response = await axios({ method, url: `${API_BASE_URL}${path}`, data: payload });
      return response.data as T;
    } catch (err) {
      const message = isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error ? err.message : 'Request failed.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchPlants = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return [];
    return requestApi<PlantSpecies[]>('get', `/plants/search?query=${encodeURIComponent(trimmedQuery)}`);
  }, [requestApi]);

  const addPlantToTank = useCallback(async (payload: {
    userId: string;
    tankId: string;
    plantId: string;
    name: string;
    scientificName: string;
    image?: string;
    imageSourceUrl?: string;
    imageLicense?: string;
    source?: string;
  }) => requestApi<SavedPlant>('post', '/plants/add', payload), [requestApi]);

  const getUserPlants = useCallback(async (userId: string) => (
    requestApi<SavedPlant[]>('get', `/plants/user/${encodeURIComponent(userId)}`)
  ), [requestApi]);

  const assessPlantAddition = useCallback(async (payload: { userId: string; tankId: string; plant: PlantSpecies }) => (
    requestApi<PlantCompatibilityAssessment>('post', '/plants/assess-add', payload)
  ), [requestApi]);

  return { loading, error, searchPlants, assessPlantAddition, addPlantToTank, getUserPlants };
}

export default usePlantApi;