import { useCallback, useState } from 'react';
import axios from 'axios';

import { useBackendApi } from './useBackendApi';

export type WaterTestRecord = {
  id: string;
  tankId: string;
  testedAt: string;
  readings: Record<string, string>;
  imageUrl: string;
  imageUploadSkipped?: boolean;
  aiReviewSkipped?: boolean;
  waterQuality: string;
  summary: string;
  nextWaterChange: string;
};

export function useWaterTestApi() {
  const { buildUrl } = useBackendApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const saveWaterTest = useCallback(async (payload: {
    userId: string;
    tankId: string;
    testedAt: string;
    readings: Record<string, string>;
    image?: string;
  }) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post<WaterTestRecord>(buildUrl('/water-tests'), payload);
      return response.data;
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error || err.message : 'Failed to save water test.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [buildUrl]);

  const getTankWaterTests = useCallback(async (tankId: string) => {
    const response = await axios.get<WaterTestRecord[]>(buildUrl(`/water-tests/tank/${tankId}`));
    return response.data;
  }, [buildUrl]);

  return { saveWaterTest, getTankWaterTests, loading, error };
}

export default useWaterTestApi;
