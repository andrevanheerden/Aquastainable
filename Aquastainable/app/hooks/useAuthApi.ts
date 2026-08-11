import { useCallback, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

type SignUpPayload = {
  email: string;
  password: string;
  username: string;
  profileImageUrl: string | null;
};

type SignInPayload = {
  email: string;
  password: string;
};

export function useAuthApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestApi = useCallback(async <T>(path: string, payload: object) => {
    setError('');
    setLoading(true);
    try {
      const response = await axios.post<T>(`${API_BASE_URL}${path}`, payload);
      return response.data;
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

  const signUp = useCallback(async (payload: SignUpPayload) => {
    return requestApi('/signup', payload);
  }, [requestApi]);

  const signIn = useCallback(async (payload: SignInPayload) => {
    return requestApi('/signin', payload);
  }, [requestApi]);

  const clearError = useCallback(() => setError(''), []);

  return { loading, error, clearError, signUp, signIn };
}
