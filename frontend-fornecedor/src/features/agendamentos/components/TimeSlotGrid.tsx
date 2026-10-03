import type { TemporaryTimeSlot } from '../data/temporaryTimeSlots';

interface TimeSlotGridProps {
  slots: TemporaryTimeSlot[];
  selectedTime: string;
  onSelect: (time: string) => void;
}

export function TimeSlotGrid({ slots, selectedTime, onSelect }: TimeSlotGridProps) {
  return (
    <fieldset className="fornecedor-time-slot-grid">
      <legend>Horários disponíveis</legend>
      <p className="fornecedor-time-slot-grid-help">Disponibilidade demonstrativa e local, preparada para futura substituição pela API.</p>
      <div className="fornecedor-time-slot-list">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.time;

          return (
            <button
              key={slot.time}
              className={`fornecedor-time-slot fornecedor-time-slot-${slot.status} ${isSelected ? 'is-selected' : ''}`}
              type="button"
              disabled={!slot.selectable}
              aria-pressed={isSelected}
              onClick={() => onSelect(slot.time)}
            >
              <span className="fornecedor-time-slot-time">{slot.time}</span>
              <span className="fornecedor-time-slot-status">{slot.label}</span>
              <span className="fornecedor-time-slot-description">{slot.description}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
