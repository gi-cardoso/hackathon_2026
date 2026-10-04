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

export const tiposItemBoletim = [
  'SACARIA_MALAS_25',
  'SACARIA_MALAS_40',
  'SACARIA_MALAS_50',
  'SACARIA_FARDO_250',
  'SACARIA_FARDO_500',
  'PECAS',
  'MAQUINAS_EQUIPAMENTOS',
  'AGROQUIMICO',
  'FERTILIZANTES',
  'SEMENTES',
  'MEDICAMENTOS',
  'ALIMENTACAO_ANIMAL',
  'ACESSORIOS_AGROPECUARIOS',
  'SERVICOS_DIVERSOS',
] as const;

export type TipoItemBoletim = typeof tiposItemBoletim[number];

export interface BoletimPayload {
  data: string;
  responsavelId?: number;
  producao: Array<{
    tipoItem: TipoItemBoletim;
    descarga: number;
    remocao: number;
    transferencia: number;
  }>;
  equipe: Array<{
    matricula: string;
    jornada: 'COMPLETA' | 'MEIA';
  }>;
}

export interface BoletimResponse {
  id_boletim: number;
  id_armazem: number | null;
  data: string;
  responsavel_id: number | null;
  diarias_equivalentes_total: number | string;
  valor_produzido_total: number | string;
  complemento_diaria_pago: number | string;
  armazem?: { nome_armazem?: string } | null;
  itens: Array<{
    id_item_boletim: number;
    tipo_servico: string;
    qtd_descarga: number | string;
    qtd_remocao: number | string;
    qtd_transferencia: number | string;
    quantidade: number | string;
    preco_unitario: number | string;
    valor_producao: number | string;
  }>;
  equipes: Array<{
    id: number;
    matricula_chapa: string | null;
    tipo_jornada: string;
  }>;
}

export interface CriarBoletimResponse {
  mensagem: string;
  boletim: BoletimResponse;
  calculo: {
    producaoTotal: number;
    diariasEquivalentes: number;
    valorPorDiaria: number;
    complemento: number;
    totalPagar: number;
  };
}

export async function createBoletim(payload: BoletimPayload) {
  const response = await api.post<CriarBoletimResponse>('/boletins', payload);
  return response.data;
}

export async function getBoletins() {
  const response = await api.get<BoletimResponse[]>('/boletins');
  return response.data;
}

export async function getBoletim(id: number) {
  const response = await api.get<BoletimResponse>(`/boletins/${id}`);
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
