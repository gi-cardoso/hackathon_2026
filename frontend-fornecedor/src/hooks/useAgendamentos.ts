import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '../services/api';

const decimalSchema = z.union([z.number(), z.string()]).transform(Number);

export const agendamentoFornecedorSchema = z.object({
  id_agendamento: z.number(),
  id_fornecedor: z.number().nullable().optional(),
  data_agendada: z.string(),
  horario_agendado: z.string(),
  tipo_acondicionamento: z.string(),
  status_agendamento: z.string(),
  id_nota: z.number().nullable().optional(),
  cargas: z.array(z.object({ peso_total: decimalSchema }).passthrough()),
});

export type AgendamentoFornecedorQuery = z.infer<typeof agendamentoFornecedorSchema> & {
  peso_total: number;
};

export function useAgendamentos() {
  return useQuery({
    queryKey: ['agendamentos', 'fornecedor'],
    queryFn: async (): Promise<AgendamentoFornecedorQuery[]> => {
      const response = await api.get<unknown>('/agendamentos/me');
      const agendamentos = z.array(agendamentoFornecedorSchema).parse(response.data);
      return agendamentos.map((agendamento) => ({
        ...agendamento,
        peso_total: agendamento.cargas[0]?.peso_total ?? 0,
      }));
    },
  });
}