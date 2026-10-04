import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AgendamentosEmptyState } from '../components/AgendamentosEmptyState';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { getApiError, cancelarAgendamento, reagendarAgendamento } from '../../../services/api';
import { useAgendamentos } from '../../../hooks/useAgendamentos';
import { Button } from '../../../components/ui/Button';
import '../styles.css';

export function AgendamentoFornecedorDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useAgendamentos();
  const item = data?.find((appointment) => String(appointment.id_agendamento) === id);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleCancelar() {
    if (!item) return;
    const motivo = window.prompt('Qual o motivo do cancelamento?');
    if (motivo === null) return;
    
    setIsProcessing(true);
    try {
      await cancelarAgendamento(item.id_agendamento, motivo);
      toast.success('Agendamento cancelado com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['agendamentos', 'fornecedor'] });
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReagendar() {
    if (!item) return;
    const novaData = window.prompt('Qual a nova data? (ex: 2026-10-15)', item.data_agendada.split('T')[0]);
    if (!novaData) return;
    const novoHorario = window.prompt('Qual o novo horário? (ex: 14:00)', item.horario_agendado);
    if (!novoHorario) return;
    const motivo = window.prompt('Qual o motivo do reagendamento?');
    if (motivo === null) return;

    setIsProcessing(true);
    try {
      await reagendarAgendamento(item.id_agendamento, { nova_data: novaData, novo_horario: novoHorario, motivo });
      toast.success('Agendamento reagendado com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['agendamentos', 'fornecedor'] });
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsProcessing(false);
    }
  }

  const canEdit = item?.status_agendamento !== 'CANCELADO' && item?.status_agendamento !== 'CONCLUIDO';

  return (
    <section className="fornecedor-agendamentos-page">
      <Link className="fornecedor-back-link" to="/agendamentos">← Meus agendamentos</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Detalhes do agendamento</h2>
        {canEdit && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" onClick={handleReagendar} disabled={isProcessing}>Reagendar</Button>
            <Button variant="danger" onClick={handleCancelar} disabled={isProcessing}>Cancelar</Button>
          </div>
        )}
      </div>
      <p className="fornecedor-agendamentos-description">Consulta do agendamento {id ? `#${id}` : 'selecionado'} no sistema da COCAPEC.</p>
      {isLoading && <div className="fornecedor-agendamentos-empty" role="status"><p>Carregando os dados do agendamento...</p></div>}
      {error && <div className="fornecedor-alert" role="alert">{getApiError(error)}</div>}
      {!isLoading && !error && (item ? <div className="fornecedor-detail-grid"><article className="fornecedor-detail-card"><span className="fornecedor-eyebrow">Entrega</span><h3>Agendamento #{item.id_agendamento}</h3><StatusBadge status={item.status_agendamento} /><dl className="fornecedor-agendamento-summary"><div><dt>Data e horário</dt><dd>{new Date(item.data_agendada).toLocaleDateString('pt-BR')} às {item.horario_agendado}</dd></div><div><dt>Acondicionamento</dt><dd>{item.tipo_acondicionamento}</dd></div><div><dt>Peso informado</dt><dd>{item.peso_total} kg</dd></div>{item.motivo_reagendamento && <div><dt>Motivo Reagendamento</dt><dd>{item.motivo_reagendamento}</dd></div>}{item.motivo_cancelamento && <div><dt>Motivo Cancelamento</dt><dd>{item.motivo_cancelamento}</dd></div>}</dl></article><article className="fornecedor-detail-card"><span className="fornecedor-eyebrow">Linha do tempo</span><h3>Acompanhamento</h3><ol className="fornecedor-timeline"><li className="is-current">Agendado</li><li>NF validada</li><li>No pátio</li><li>Concluído</li></ol></article></div> : <AgendamentosEmptyState title="Agendamento não encontrado" description="Este agendamento não foi encontrado entre os seus registros no sistema." />)}
    </section>
  );
}
