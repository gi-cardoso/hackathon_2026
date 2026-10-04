import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AgendamentosEmptyState } from '../components/AgendamentosEmptyState';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { getApiError, cancelarAgendamento, reagendarAgendamento, getAvailability } from '../../../services/api';
import type { AvailabilitySlot } from '../../../services/api';
import { useAgendamentos } from '../../../hooks/useAgendamentos';
import { Button } from '../../../components/ui/Button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { isWeekend } from 'date-fns';
import '../styles.css';



export function AgendamentoFornecedorDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useAgendamentos();
  const item = data?.find((appointment) => String(appointment.id_agendamento) === id);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReagendando, setIsReagendando] = useState(false);
  const [isCancelando, setIsCancelando] = useState(false);
  
  // States para reagendamento
  const [novaData, setNovaData] = useState('');
  const [novoHorario, setNovoHorario] = useState('');
  const [motivoReagendamento, setMotivoReagendamento] = useState('');
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // States para cancelamento
  const [motivoCancelamento, setMotivoCancelamento] = useState('');

  useEffect(() => {
    if (!novaData || !item?.tipo_acondicionamento) {
      return;
    }
    let active = true;
    setLoadingSlots(true);
    getAvailability(novaData, item.tipo_acondicionamento)
      .then((response) => { if (active) setSlots(response.horarios); })
      .catch((err: unknown) => { if (active) toast.error(getApiError(err)); })
      .finally(() => { if (active) setLoadingSlots(false); });
    return () => { active = false; };
  }, [novaData, item?.tipo_acondicionamento]);

  async function handleConfirmarCancelamento() {
    if (!item || !motivoCancelamento) return;
    setIsProcessing(true);
    try {
      await cancelarAgendamento(item.id_agendamento, motivoCancelamento);
      toast.success('Agendamento cancelado com sucesso.');
      setIsCancelando(false);
      queryClient.invalidateQueries({ queryKey: ['agendamentos', 'fornecedor'] });
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleConfirmarReagendamento() {
    if (!item || !novaData || !novoHorario || !motivoReagendamento) return;
    setIsProcessing(true);
    try {
      await reagendarAgendamento(item.id_agendamento, { nova_data: novaData, novo_horario: novoHorario, motivo: motivoReagendamento });
      toast.success('Agendamento reagendado com sucesso.');
      setIsReagendando(false);
      queryClient.invalidateQueries({ queryKey: ['agendamentos', 'fornecedor'] });
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsProcessing(false);
    }
  }

  const canEdit = item?.status_agendamento !== 'CANCELADO' && item?.status_agendamento !== 'CONCLUIDO' && item?.status_agendamento !== 'REJEITADO';

  return (
    <section className="fornecedor-agendamentos-page">
      <Link className="fornecedor-back-link" to="/agendamentos">← Meus agendamentos</Link>
      <div className="fornecedor-agendamentos-heading">
        <div>
          <h2>Detalhes do agendamento</h2>
          <p>Consulta do agendamento {id ? `#${id}` : 'selecionado'} no sistema da COCAPEC.</p>
        </div>
        {canEdit && !isReagendando && !isCancelando && (
          <div className="fornecedor-confirmation-actions">
            <Button variant="secondary" onClick={() => setIsReagendando(true)} disabled={isProcessing}>Reagendar</Button>
            <Button variant="danger" onClick={() => setIsCancelando(true)} disabled={isProcessing}>Cancelar</Button>
          </div>
        )}
      </div>
      {isLoading && <div className="fornecedor-agendamentos-empty" role="status"><p>Carregando os dados do agendamento...</p></div>}
      {error && <div className="fornecedor-alert" role="alert">{getApiError(error)}</div>}
      
      {!isLoading && !error && (item ? (
        <div className="fornecedor-detail-grid">
          <article className="fornecedor-detail-card">
            <span className="fornecedor-eyebrow">Entrega</span>
            <h3>Agendamento #{item.id_agendamento}</h3>
            <StatusBadge status={item.status_agendamento} />
            <dl className="fornecedor-agendamento-summary">
              <div><dt>Data e horário</dt><dd>{new Date(item.data_agendada).toLocaleDateString('pt-BR')} às {item.horario_agendado}</dd></div>
              <div><dt>Acondicionamento</dt><dd>{item.tipo_acondicionamento}</dd></div>
              <div><dt>Peso informado</dt><dd>{item.peso_total} kg</dd></div>
              {item.motivo_reagendamento && <div><dt>Motivo Reagendamento</dt><dd>{item.motivo_reagendamento}</dd></div>}
              {item.motivo_cancelamento && <div><dt>Motivo Cancelamento</dt><dd>{item.motivo_cancelamento}</dd></div>}
            </dl>
          </article>

          {isCancelando && (
            <article className="fornecedor-detail-card" style={{ borderColor: 'var(--color-danger)' }}>
              <span className="fornecedor-eyebrow" style={{ color: 'var(--color-danger)' }}>Cancelamento</span>
              <h3>Cancelar agendamento</h3>
              <p>Ao cancelar este agendamento, você perderá a janela de horário atual.</p>
              
              <div className="fornecedor-form-group" style={{ marginTop: '16px' }}>
                <label htmlFor="motivoCancelamento">Por que você está cancelando?</label>
                <input id="motivoCancelamento" type="text" placeholder="Ex: Carga não ficou pronta a tempo" value={motivoCancelamento} onChange={(e) => setMotivoCancelamento(e.target.value)} />
              </div>

              <div className="fornecedor-confirmation-actions" style={{ marginTop: '24px' }}>
                <Button variant="danger" onClick={() => void handleConfirmarCancelamento()} disabled={isProcessing || !motivoCancelamento}>
                  Confirmar Cancelamento
                </Button>
                <Button variant="ghost" onClick={() => setIsCancelando(false)} disabled={isProcessing}>Desistir</Button>
              </div>
            </article>
          )}

          {isReagendando && (
            <article className="fornecedor-detail-card">
              <span className="fornecedor-eyebrow">Reagendamento</span>
              <h3>Escolha os novos dados</h3>
              <div className="fornecedor-agendamento-form" style={{ marginTop: '24px' }}>
                <div className="fornecedor-form-group">
                  <label htmlFor="novaData">Nova data da entrega</label>
                  <DatePicker selected={novaData ? new Date(`${novaData}T00:00:00`) : null} onChange={(d: Date | null) => { if (d) { setNovaData(d.toISOString().split('T')[0]); setNovoHorario(''); setSlots([]); } }} minDate={new Date()} filterDate={(d: Date) => !isWeekend(d)} dateFormat="dd/MM/yyyy" placeholderText="Selecione uma data" className="ui-input" />
                </div>
                
                {novaData && (
                  <div className="fornecedor-slot-grid" aria-live="polite">
                    {loadingSlots ? <p>Consultando disponibilidade...</p> : slots.map((slot) => (
                      <button key={slot.horario} type="button" disabled={!slot.disponivel} className={`fornecedor-slot ${slot.disponivel ? 'is-available' : 'is-occupied'} ${novoHorario === slot.horario ? 'is-selected' : ''}`} onClick={() => setNovoHorario(slot.horario)}>
                        <strong>{slot.horario}</strong>
                        <span>{slot.disponivel ? `${slot.vagas_restantes} vaga(s)` : 'Ocupado'}</span>
                      </button>
                    ))}
                  </div>
                )}

                {novoHorario && (
                  <div className="fornecedor-form-group">
                    <label htmlFor="motivoReagendamento">Motivo do reagendamento</label>
                    <input id="motivoReagendamento" type="text" placeholder="Ex: Atraso na transportadora" value={motivoReagendamento} onChange={(e) => setMotivoReagendamento(e.target.value)} />
                  </div>
                )}

                <div className="fornecedor-confirmation-actions" style={{ marginTop: '8px' }}>
                  <Button onClick={() => void handleConfirmarReagendamento()} disabled={isProcessing || !novaData || !novoHorario || !motivoReagendamento}>
                    Confirmar Reagendamento
                  </Button>
                  <Button variant="ghost" onClick={() => setIsReagendando(false)} disabled={isProcessing}>Cancelar</Button>
                </div>
              </div>
            </article>
          )}

          {!isReagendando && !isCancelando && (
            <article className="fornecedor-detail-card">
              <span className="fornecedor-eyebrow">Linha do tempo</span>
              <h3>Acompanhamento</h3>
              <ol className="fornecedor-timeline">
                <li className={item.status_agendamento === 'PENDENTE' || item.status_agendamento === 'REAGENDADO' ? 'is-current' : 'is-completed'}>Agendado</li>
                <li className={item.status_agendamento === 'APROVADO' ? 'is-current' : ''}>NF validada</li>
                <li>No pátio</li>
                <li>Concluído</li>
              </ol>
            </article>
          )}
        </div>
      ) : <AgendamentosEmptyState title="Agendamento não encontrado" description="Este agendamento não foi encontrado entre os seus registros no sistema." />)}
    </section>
  );
}
