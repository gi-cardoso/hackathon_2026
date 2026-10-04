import { Link, useParams } from 'react-router-dom';
import { AgendamentosEmptyState } from '../components/AgendamentosEmptyState';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { getApiError } from '../../../services/api';
import { useAgendamentos } from '../../../hooks/useAgendamentos';
import '../styles.css';

export function AgendamentoFornecedorDetailPage() {
  const { id } = useParams();
  const { data, error, isLoading } = useAgendamentos();
  const item = data?.find((appointment) => String(appointment.id_agendamento) === id);

  return (
    <section className="fornecedor-agendamentos-page">
      <Link className="fornecedor-back-link" to="/agendamentos">← Meus agendamentos</Link>
      <h2>Detalhes do agendamento</h2>
      <p className="fornecedor-agendamentos-description">Consulta do agendamento {id ? `#${id}` : 'selecionado'} no sistema da COCAPEC.</p>
      {isLoading && <div className="fornecedor-agendamentos-empty" role="status"><p>Carregando os dados do agendamento...</p></div>}
      {error && <div className="fornecedor-alert" role="alert">{getApiError(error)}</div>}
      {!isLoading && !error && (item ? <div className="fornecedor-detail-grid"><article className="fornecedor-detail-card"><span className="fornecedor-eyebrow">Entrega</span><h3>Agendamento #{item.id_agendamento}</h3><StatusBadge status={item.status_agendamento} /><dl className="fornecedor-agendamento-summary"><div><dt>Data e horário</dt><dd>{new Date(item.data_agendada).toLocaleDateString('pt-BR')} às {item.horario_agendado}</dd></div><div><dt>Acondicionamento</dt><dd>{item.tipo_acondicionamento}</dd></div><div><dt>Peso informado</dt><dd>{item.peso_total} kg</dd></div></dl></article><article className="fornecedor-detail-card"><span className="fornecedor-eyebrow">Linha do tempo</span><h3>Acompanhamento</h3><ol className="fornecedor-timeline"><li className="is-current">Agendado</li><li>NF validada</li><li>No pátio</li><li>Concluído</li></ol></article></div> : <AgendamentosEmptyState title="Agendamento não encontrado" description="Este agendamento não foi encontrado entre os seus registros no sistema." />)}
    </section>
  );
}
