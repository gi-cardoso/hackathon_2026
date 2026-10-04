import { Link } from 'react-router-dom';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { getApiError } from '../../../services/api';
import { useAgendamentos } from '../../../hooks/useAgendamentos';
import { AgendamentosEmptyState } from '../components/AgendamentosEmptyState';
import { useState } from 'react';
import '../styles.css';

export function MeusAgendamentosPage() {
  const [status, setStatus] = useState('TODOS');
  const { data, error, isLoading } = useAgendamentos();
  const agendamentos = (data ?? []).filter((item) => status === 'TODOS' || item.status_agendamento === status);
  return (
    <section className="fornecedor-agendamentos-page">
      <div className="fornecedor-agendamentos-heading">
        <div>
          <h2>Meus agendamentos</h2>
          <p>Acompanhe as entregas registradas no sistema da COCAPEC.</p>
        </div>
        <Link className="fornecedor-button" to="/agendamentos/novo">Novo agendamento</Link>
      </div>
      <label className="fornecedor-filter">Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="TODOS">Todos</option><option value="PENDENTE">Pendente</option><option value="APROVADO">Aprovado</option><option value="REJEITADO">Rejeitado</option></select></label>
      {isLoading && <div className="fornecedor-agendamentos-empty" role="status"><p>Carregando seus agendamentos...</p></div>}
      {error && <div className="fornecedor-alert" role="alert">{getApiError(error)}</div>}
      {!isLoading && !error && agendamentos.length === 0 && <AgendamentosEmptyState title="Nenhum agendamento encontrado" description="Crie um agendamento para acompanhar a entrega por aqui." />}
      {!isLoading && !error && agendamentos.length > 0 && <div className="fornecedor-appointment-list">{agendamentos.map((item) => <Link className="fornecedor-appointment-card" to={`/agendamentos/${item.id_agendamento}`} key={item.id_agendamento}><div><strong>Agendamento #{item.id_agendamento}</strong><span>{new Date(item.data_agendada).toLocaleDateString('pt-BR')} às {item.horario_agendado}</span><span>{item.tipo_acondicionamento} · {item.peso_total} kg</span></div><StatusBadge status={item.status_agendamento} /></Link>)}</div>}
    </section>
  );
}
