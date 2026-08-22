import { useCallback, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

export type WaterTestRecord = {
  id: string;
  tankId: string;
  testedAt: string;
  readings: Record<string, string>;
  imageUrl: string;
  imageUploadSkipped?: boolean;
  waterQuality: string;
  summary: string;
  nextWaterChange: string;
};

export function useWaterTestApi() {
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
      const response = await axios.post<WaterTestRecord>(`${API_BASE_URL}/water-tests`, payload);
      return response.data;
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error || err.message : 'Failed to save water test.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTankWaterTests = useCallback(async (tankId: string) => {
    const response = await axios.get<WaterTestRecord[]>(`${API_BASE_URL}/water-tests/tank/${tankId}`);
    return response.data;
  }, []);

  return { saveWaterTest, getTankWaterTests, loading, error };
}

export default useWaterTestApi;
