import { useCallback, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

export type TankApiPayload = {
  user_id: string;
  tankName: string;
  tankImg?: string;
  waterType: string;
  tankSize: number;
  overview?: string;
  aquaCare?: Record<string, unknown>;
  tankId?: string;
};

export type TankRecord = {
  id: string;
  tankId: string;
  user_id: string;
  tankName: string;
  tankImg: string;
  waterType: string;
  tankSize: number;
  overview: string;
  aquaCare: Record<string, unknown>;
  createdAt?: string;
};

export function useTankApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestApi = useCallback(async <T>(method: 'get' | 'post', path: string, payload?: object) => {
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

  const createTank = useCallback(async (payload: TankApiPayload) => {
    return requestApi<TankRecord>('post', '/tanks', payload);
  }, [requestApi]);

  const getUserTanks = useCallback(async (userId: string) => {
    return requestApi<TankRecord[]>('get', `/tanks/${userId}`);
  }, [requestApi]);

  const getTankById = useCallback(async (userId: string, tankId: string) => {
    return requestApi<TankRecord>('get', `/tanks/${userId}/${tankId}`);
  }, [requestApi]);

  const clearError = useCallback(() => setError(''), []);

  return { loading, error, clearError, createTank, getUserTanks, getTankById };
}

export default useTankApi;
