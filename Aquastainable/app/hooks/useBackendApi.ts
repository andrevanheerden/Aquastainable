import { useCallback } from 'react';

export const API_BASE_URL = 'https://aquastainable.onrender.com';

export function useBackendApi() {
  const buildUrl = useCallback((path: string) => `${API_BASE_URL}${path}`, []);

  return { buildUrl };
}

export default useBackendApi;
