import { useCallback, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

export type AiChatMessage = {
  id?: string;
  question: string;
  answer: string;
  context?: Record<string, unknown>;
  createdAt?: string;
};

export type AiChat = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: AiChatMessage[];
};

export function useAiApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const request = useCallback(async <T,>(method: 'get' | 'post', path: string, data?: object) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios({ method, url: `${API_BASE_URL}${path}`, data, params: method === 'get' ? data : undefined });
      return response.data as T;
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error || err.message : 'AI request failed.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const askAssistant = useCallback(async (payload: { userId: string; chatId?: string; message: string; context: Record<string, unknown>; history: Array<{ role: 'user' | 'assistant'; content: string }> }) => request<{ answer: string; model: string; chatId: string }>('post', '/ai/assistant', payload), [request]);
  const getChats = useCallback((userId: string) => request<AiChat[]>('get', '/ai/assistant/chats', { userId }), [request]);
  const getChat = useCallback((userId: string, chatId: string) => request<AiChat>('get', `/ai/assistant/chats/${chatId}`, { userId }), [request]);

  return { askAssistant, getChats, getChat, loading, error };
}

export default useAiApi;
