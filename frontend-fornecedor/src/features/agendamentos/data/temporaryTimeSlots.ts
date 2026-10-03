export type Acondicionamento = 'Batido/Solto' | 'Paletizado/Sacaria' | 'Big Bag';
export type TimeSlotStatus = 'available' | 'occupied' | 'partially-occupied' | 'unavailable';

export interface TemporaryTimeSlot {
  time: string;
  status: TimeSlotStatus;
  label: string;
  description: string;
  selectable: boolean;
}

const fixedTimes = ['08:00', '10:00', '13:00', '15:00'];

/*
 * Snapshot local apenas para demonstrar os estados da grade.
 * Substituir esta função pela resposta de disponibilidade da API quando ela existir.
 */
export function getTemporaryTimeSlots(date: string, acondicionamento: string): TemporaryTimeSlot[] {
  if (!date || !acondicionamento) {
    return fixedTimes.map((time) => ({
      time,
      status: 'unavailable',
      label: 'Indisponível',
      description: 'Selecione a data e o tipo de acondicionamento para consultar a disponibilidade visual.',
      selectable: false,
    }));
  }

  const isBatido = acondicionamento === 'Batido/Solto';

  return [
    {
      time: '08:00',
      status: 'occupied',
      label: 'Ocupado',
      description: 'Estado temporário: este horário está ocupado por uma carga exclusiva.',
      selectable: false,
    },
    isBatido
      ? {
          time: '10:00',
          status: 'unavailable',
          label: 'Indisponível',
          description: 'Batido/Solto exige exclusividade; o horário tem ocupação compartilhada temporária.',
          selectable: false,
        }
      : {
          time: '10:00',
          status: 'partially-occupied',
          label: 'Parcialmente ocupado',
          description: 'Estado temporário: 1 de 2 vagas compartilháveis está ocupada.',
          selectable: true,
        },
    {
      time: '13:00',
      status: 'occupied',
      label: 'Ocupado',
      description: 'Estado temporário: as 2 vagas compartilháveis deste horário estão ocupadas.',
      selectable: false,
    },
    {
      time: '15:00',
      status: 'available',
      label: 'Disponível',
      description: isBatido
        ? 'Disponível para uma carga exclusiva Batido/Solto.'
        : 'Disponível para até 2 caminhões de carga compartilhável.',
      selectable: true,
    },
  ];
}
