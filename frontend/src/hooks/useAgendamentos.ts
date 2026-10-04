import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '../services/api';

export const agendamentoSchema = z.object({
  id_agendamento: z.number(),
  data_agendada: z.string(),
  horario_agendado: z.string(),
  tipo_acondicionamento: z.string(),
  status_agendamento: z.string(),
  id_nota: z.number().optional(),
  peso_total: z.number(),
});

export type Agendamento = z.infer<typeof agendamentoSchema>;

export function useAgendamentos() {
  return useQuery({
    queryKey: ['agendamentos', 'analise'],
    queryFn: async (): Promise<Agendamento[]> => {
      const response = await api.get<unknown>('/agendamentos/analise/compras');
      return z.array(agendamentoSchema).parse(response.data);
    },
  });
}