import { useCallback, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

export type FishSpecies = {
  id: string;
  name: string;
  scientificName: string;
  image: string;
  schoolSize: string;
  tempC: string;
  pH: string;
};

export type TankFish = FishSpecies & {
  fishId: string;
  tankId: string;
  addedAt?: string;
};

export function useFishApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestApi = useCallback(async <T,>(method: 'get' | 'post' | 'delete', path: string, payload?: object) => {
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
    async (userId: string, tankId: string, fishId: string, schoolSize: string, fishData?: { name?: string; scientificName?: string; image?: string }) => {
      return requestApi<TankFish>('post', '/fish/add', {
        userId,
        tankId,
        fishId,
        schoolSize,
        name: fishData?.name,
        scientificName: fishData?.scientificName,
        image: fishData?.image,
      });
    },
    [requestApi]
  );

  const getTankFish = useCallback(async (tankId: string) => {
    return requestApi<TankFish[]>('get', `/fish/tank/${tankId}`);
  }, [requestApi]);

  const removeFishFromTank = useCallback(
    async (tankId: string, fishDocId: string) => {
      return requestApi<{ success: boolean }>('delete', `/fish/${tankId}/${fishDocId}`);
    },
    [requestApi]
  );

  const clearError = useCallback(() => setError(''), []);

  return { loading, error, clearError, searchFish, addFishToTank, getTankFish, removeFishFromTank };
}
