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
  if (axios.isAxiosError<{ error?: string; erro?: string; details?: string }>(error)) {
    return error.response?.data?.error || error.response?.data?.erro || error.response?.data?.details || 'Não foi possível concluir a operação.';
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

export interface Armazem {
  id_armazem: number;
  nome_armazem: string;
  codigo_deposito: string;
  grupo: string;
}

export interface Equipamento {
  id_tipo_equipamento: number;
  nome: string;
  armazem_base: string | null;
  quantidade_disponivel: number;
}

export interface AgendamentoOperacao {
  id_agendamento: number;
  id_fornecedor: number;
  id_nota: number;
  numero_pedido_compra: string | null;
  data_agendada: string;
  horario_agendado: string;
  tipo_acondicionamento: string;
  status_agendamento: string;
  qtd_chapas_prevista: number;
  regra_chapas_aplicada: string;
  fornecedor?: {
    id_fornecedor: number;
    codigo_fornecedor_cocapec: string | null;
    nome_fornecedor: string;
    cnpj: string;
    contato: string | null;
  } | null;
  recebimentos: Array<{ id_recebimento: number; status_recebimento: string }>;
  nao_recebimentos: Array<{ id: number; motivo_padronizado: string; observacao: string | null }>;
}

export interface NaoRecebimentoPayload {
  id_agendamento: number;
  motivo_padronizado: string;
  observacao?: string;
  data_registro: string;
}

export interface NaoRecebimentoResponse {
  id: number;
  id_agendamento: number;
  motivo_padronizado: string;
  observacao: string | null;
  data_registro: string;
  id_usuario_registro: number;
}

export async function getArmazens() {
  const response = await api.get<Armazem[]>('/armazens');
  return response.data;
}

export async function getEquipamentos() {
  const response = await api.get<Equipamento[]>('/equipamentos');
  return response.data;
}

export async function getAgendamentosOperacao(status?: string) {
  const query = status ? `?status=${status}` : '';
  const response = await api.get<AgendamentoOperacao[]>(`/agendamentos${query}`);
  return response.data;
}

export async function getNaoRecebimentoMotivos() {
  const response = await api.get<{ motivos: string[]; observacao_obrigatoria_para: string[] }>('/nao-recebimentos/motivos');
  return response.data;
}

export async function createNaoRecebimento(payload: NaoRecebimentoPayload) {
  const response = await api.post<NaoRecebimentoResponse>('/nao-recebimentos', payload);
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

export interface DashboardOperacaoResponse {
  periodo: {
    data_inicio: string;
    data_fim: string;
    timezone: string;
  };
  resumo: {
    cargas_recebidas: number;
    recebimentos_concluidos: number;
    nao_recebimentos: number;
    peso_total_recebido_kg: number;
    fornecedores_atendidos: number;
    armazens_utilizados: number;
  };
  cargas_recebidas_por_dia: Array<{
    data: string;
    quantidade_cargas: number;
    peso_total_kg: number;
  }>;
  cargas_recebidas_por_armazem: Array<{
    id_armazem: number;
    nome_armazem: string;
    quantidade_cargas: number;
    peso_total_kg: number;
    percentual_do_total: number;
    diarias_pagas: number;
  }>;
  tempos_operacionais: {
    tempo_medio_espera_minutos: number;
    tempo_medio_descarga_minutos: number;
    tempo_medio_total_no_armazem_minutos: number;
  };
  fornecedores_com_maior_volume: Array<{
    id_fornecedor: number;
    nome_fornecedor: string;
    quantidade_cargas: number;
    peso_total_kg: number;
    percentual_do_total: number;
  }>;
  custo_estimado_mao_de_obra: {
    valor_total: number;
    boletins: {
      custo_registrado: number;
      diarias_equivalentes: number;
    };
  };
  dimensionamento_chapas: {
    situacao_geral: string;
    chapas_previstos_total: number;
    chapas_utilizados_total: number;
  };
  colaboradores_por_recebimento: {
    media_chapas_por_recebimento: number;
    menor_quantidade: number;
    maior_quantidade: number;
    distribuicao: Array<{
      qtd_chapas: number;
      quantidade_recebimentos: number;
    }>;
  };
  utilizacao_locais_descarga: Array<{
    id_armazem: number;
    nome_armazem: string;
    quantidade_cargas: number;
    peso_total_kg: number;
    percentual_do_total: number;
    metodologia: string;
  }>;
  movimento: {
    por_horario: Array<{
      horario: string;
      quantidade_agendamentos: number;
      quantidade_recebimentos: number;
    }>;
    por_dia_semana: Array<{
      dia_semana: string;
      quantidade_agendamentos: number;
      quantidade_recebimentos: number;
    }>;
    horario_de_maior_movimento: {
      horario: string;
      quantidade_agendamentos: number;
      quantidade_recebimentos: number;
    } | null;
    dia_de_maior_movimento: {
      dia_semana: string;
      quantidade_agendamentos: number;
      quantidade_recebimentos: number;
    } | null;
  };
  nao_recebimentos: {
    total: number;
    por_motivo: Array<{
      motivo: string;
      quantidade: number;
      percentual: number;
    }>;
    metodologia_data: string;
  };
  analise_chapas: {
    chapas_alocados_estimativa: number;
    diarias_equivalentes_boletim: number;
    prejuizo_estimado: number;
    sobra_em_pessoas: number;
    cargas_retidas: number;
    status_gargalo: string;
    producao_total: number;
    garantia_minima: number;
  };
}

export async function getDashboardOperacao(dataInicio: string, dataFim: string) {
  const response = await api.get<DashboardOperacaoResponse>(`/dashboard/operacao?data_inicio=${dataInicio}&data_fim=${dataFim}`);
  return response.data;
}

export interface UserResponse {
  id_usuario: number;
  nome: string;
  matricula: string;
  email: string;
  ativo: boolean;
  role: string;
}

export interface CreateUserPayload {
  nome: string;
  email: string;
  matricula: string;
  senha?: string;
  role: string;
  ativo?: boolean;
}

export async function getUsers() {
  const response = await api.get<UserResponse[]>('/users');
  return response.data;
}

export async function createUser(payload: CreateUserPayload) {
  const response = await api.post<UserResponse>('/users', payload);
  return response.data;
}

export async function deleteUser(id: number) {
  await api.delete(`/users/${id}`);
}
