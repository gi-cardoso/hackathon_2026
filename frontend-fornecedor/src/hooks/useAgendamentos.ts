import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '../services/api';

export const agendamentoFornecedorSchema = z.object({
  id_agendamento: z.number(),
  data_agendada: z.string(),
  horario_agendado: z.string(),
  tipo_acondicionamento: z.string(),
  status_agendamento: z.string(),
  id_nota: z.number().optional(),
  peso_total: z.number(),
});

export type AgendamentoFornecedorQuery = z.infer<typeof agendamentoFornecedorSchema>;

export function useAgendamentos() {
  return useQuery({
    queryKey: ['agendamentos', 'fornecedor'],
    queryFn: async (): Promise<AgendamentoFornecedorQuery[]> => {
      const response = await api.get<unknown>('/agendamentos/me');
      return z.array(agendamentoFornecedorSchema).parse(response.data);
    },
  });
}