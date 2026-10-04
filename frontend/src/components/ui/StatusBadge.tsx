import './ui.css';
type Status = 'AGENDADO' | 'NF_VALIDADA' | 'NO_PATIO' | 'DESCARREGANDO' | 'CONCLUIDO' | 'CANCELADO' | 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'REAGENDADO';
const labels: Record<Status, string> = { AGENDADO: 'Agendado', NF_VALIDADA: 'NF validada', NO_PATIO: 'No pátio', DESCARREGANDO: 'Descarregando', CONCLUIDO: 'Concluído', CANCELADO: 'Cancelado', PENDENTE: 'Pendente', APROVADO: 'Aprovado', REJEITADO: 'Rejeitado', REAGENDADO: 'Reagendado' };
export function StatusBadge({ status }: { status: string }) { const normalized = status.toUpperCase() as Status; return <span className={`ui-status ui-status-${normalized.toLowerCase()}`}>{labels[normalized] ?? status}</span>; }
