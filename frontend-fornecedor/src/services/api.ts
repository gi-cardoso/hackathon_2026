import axios from 'axios';
import { toast } from 'sonner';
import { z } from 'zod';

export interface InvoiceData {
  id_nota?: number;
  identificacao?: { numero?: string; serie?: string; naturezaOperacao?: string };
  emitente?: { razaoSocial?: string };
  totais?: { valorNota?: number };
  transporte?: { volumes?: { pesoBruto?: number } };
}

export interface AvailabilitySlot {
  horario: string;
  disponivel: boolean;
  vagas_restantes: number;
  quantidade_agendamentos: number;
  tipos_disponiveis: string[];
}

export interface AvailabilityResponse {
  data: string;
  horarios: AvailabilitySlot[];
}

export interface AgendamentoFornecedor {
  id_agendamento: number;
  id_fornecedor?: number | null;
  data_agendada: string;
  horario_agendado: string;
  tipo_acondicionamento: string;
  status_agendamento: string;
  id_nota?: number | null;
  peso_total: number;
  cargas: Array<{ peso_total: number }>;
}

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

export async function uploadInvoice(file: File): Promise<InvoiceData> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<InvoiceData>('/invoices/parse', formData);
  return response.data;
}

export async function getAvailability(data: string, tipoAcondicionamento: string): Promise<AvailabilityResponse> {
  const response = await api.get<AvailabilityResponse>('/agendamentos/disponibilidade', {
    params: { data, tipo_acondicionamento: tipoAcondicionamento },
  });
  return response.data;
}

export async function createAgendamento(payload: {
  id_nota?: number;
  data_agendada: string;
  horario_agendado: string;
  tipo_acondicionamento: string;
  peso_total: number;
}) {
  const response = await api.post<AgendamentoFornecedor>('/agendamentos', payload);
  return response.data;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@COCAPEC_FORNECEDOR:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('@COCAPEC_FORNECEDOR:token');
      localStorage.removeItem('@COCAPEC_FORNECEDOR:user');
      window.dispatchEvent(new CustomEvent('cocapec:session-expired'));
      toast.error('Sua sessão expirou. Entre novamente.');
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);
