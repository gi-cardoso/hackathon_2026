import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getApiError } from '../services/api';
import { useAgendamentos } from '../hooks/useAgendamentos';
import './DashboardFornecedor.css';

export default function DashboardFornecedor() {
  const { fornecedor } = useAuth();
  const { data, error, isLoading } = useAgendamentos();
  const agendamentos = data ?? [];

  return <div className="dashboard-page">
    <div className="dashboard-header">
      <div className="dashboard-intro">
        <h2>Olá, {fornecedor?.nome_fornecedor || 'fornecedor'}.</h2>
        <p>Organize suas entregas e acompanhe cada etapa do recebimento na COCAPEC.</p>
      </div>
      <Link className="dashboard-new-button" to="/agendamentos/novo"><strong>Novo agendamento</strong><span>Envie sua NF e reserve um horário de entrega.</span><b aria-hidden="true">+</b></Link>
    </div>
    <div className="dashboard-grid">
      <Card><span className="dashboard-card-label">Acompanhamento</span><h3>Próximos agendamentos</h3>{isLoading ? <p className="dashboard-empty">Carregando seus agendamentos...</p> : error ? <p className="dashboard-empty">{getApiError(error)}</p> : agendamentos.length === 0 ? <p className="dashboard-empty">Você ainda não possui agendamentos registrados.</p> : <div className="dashboard-appointments">{agendamentos.slice(0, 3).map((item) => <Link className="dashboard-appointment" to={`/agendamentos/${item.id_agendamento}`} key={item.id_agendamento}><span><strong>{new Date(item.data_agendada).toLocaleDateString('pt-BR')}</strong><small>{item.horario_agendado} · {item.tipo_acondicionamento}</small></span><StatusBadge status={item.status_agendamento} /></Link>)}</div>}</Card>
    </div>
  </div>;
}
