import { Link } from 'react-router-dom';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { getStoredAgendamentos } from '../../../services/api';
import { useState } from 'react';
import '../styles.css';

export function MeusAgendamentosPage() {
  const [status, setStatus] = useState('TODOS');
  const agendamentos = getStoredAgendamentos().filter((item) => status === 'TODOS' || item.status_agendamento === status);
  return (
    <section className="fornecedor-agendamentos-page">
      <div className="fornecedor-agendamentos-heading">
        <div>
          <h2>Meus agendamentos</h2>
          <p>Acompanhe as entregas criadas neste navegador enquanto o endpoint de consulta é preparado.</p>
        </div>
        <Link className="fornecedor-button" to="/agendamentos/novo">Novo agendamento</Link>
      </div>
      <label className="fornecedor-filter">Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="TODOS">Todos</option><option value="PENDENTE">Pendente</option><option value="APROVADO">Aprovado</option><option value="REJEITADO">Rejeitado</option></select></label>
      {agendamentos.length === 0 ? <div className="fornecedor-agendamentos-empty"><h3>Nenhum agendamento encontrado</h3><p>Crie um agendamento para acompanhar a entrega por aqui.</p></div> : <div className="fornecedor-appointment-list">{agendamentos.map((item) => <Link className="fornecedor-appointment-card" to={`/agendamentos/${item.id_agendamento}`} key={item.id_agendamento}><div><strong>Agendamento #{item.id_agendamento}</strong><span>{new Date(item.data_agendada).toLocaleDateString('pt-BR')} às {item.horario_agendado}</span><span>{item.tipo_acondicionamento} · {item.peso_total} kg</span></div><StatusBadge status={item.status_agendamento} /></Link>)}</div>}
    </section>
  );
}
