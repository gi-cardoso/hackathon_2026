import axios from 'axios';
import { toast } from 'sonner';
import { z } from 'zod';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export function getApiError(error: unknown): string {
  if (axios.isAxiosError<{ error?: string; details?: string }>(error)) {
    return error.response?.data?.error || error.response?.data?.details || 'Não foi possível concluir a operação.';
  }
  return 'Não foi possível concluir a operação.';
}

export function parseApiResponse<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data);
}

// Interceptor para adicionar o token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@COCAPEC:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('@COCAPEC:token');
      localStorage.removeItem('@COCAPEC:user');
      window.dispatchEvent(new CustomEvent('cocapec:session-expired'));
      toast.error('Sua sessão expirou. Entre novamente.');
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);
