import axios from 'axios';
import { toast } from 'sonner';
import { z } from 'zod';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export interface RecebimentoPayload {
  id_agendamento: number;
  id_armazem: number;
  hora_chegada: string;
  hora_entrada: string;
  hora_saida: string;
  qtd_chapas_utilizados: number;
  equipamentos: Array<{
    id_tipo_equipamento: number;
    quantidade_utilizada: number;
  }>;
}

export interface RecebimentoResponse {
  id_recebimento: number;
  id_agendamento: number;
  hora_chegada: string;
  hora_entrada: string;
  hora_saida: string;
  status_recebimento: string;
  agendamento?: {
    data_agendada: string;
    horario_agendado: string;
    status_agendamento: string;
    fornecedor?: { nome_fornecedor?: string | null; cnpj?: string | null } | null;
  } | null;
  descargas: Array<{
    id_descarga: number;
    id_armazem: number | null;
    qtd_chapas_utilizados: number;
    armazem?: { nome_armazem?: string } | null;
    equipamentos: Array<{
      id_tipo_equipamento: number;
      quantidade_utilizada: number;
      equipamento?: { nome?: string } | null;
    }>;
  }>;
}

export function getApiError(error: unknown): string {
  if (axios.isAxiosError<{ error?: string; details?: string }>(error)) {
    return error.response?.data?.error || error.response?.data?.details || 'Não foi possível concluir a operação.';
  }
  return 'Não foi possível concluir a operação.';
}

export function parseApiResponse<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data);
}

export async function createRecebimento(payload: RecebimentoPayload) {
  const response = await api.post<RecebimentoResponse>('/recebimentos', payload);
  return response.data;
}

export async function getRecebimento(id: number) {
  const response = await api.get<RecebimentoResponse>(`/recebimentos/${id}`);
  return response.data;
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
