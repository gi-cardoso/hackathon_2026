import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getStoredAgendamentos } from '../services/api';
import './DashboardFornecedor.css';

export default function DashboardFornecedor() {
  const { fornecedor } = useAuth();
  const agendamentos = getStoredAgendamentos();

  return <div className="dashboard-page">
    <div className="dashboard-intro">
      <span className="dashboard-eyebrow">Portal do fornecedor</span>
      <h2>Olá, {fornecedor?.nome_fornecedor || 'fornecedor'}.</h2>
      <p>Organize suas entregas e acompanhe cada etapa do recebimento na COCAPEC.</p>
    </div>
    <Link className="dashboard-new-button" to="/agendamentos/novo"><strong>Novo agendamento</strong><span>Envie sua NF e reserve um horário de entrega.</span><b aria-hidden="true">+</b></Link>
    <div className="dashboard-grid">
      <Card><span className="dashboard-card-label">Cadastro</span><h3>Dados do fornecedor</h3><dl className="fornecedor-details"><div><dt>CNPJ</dt><dd>{fornecedor?.cnpj || 'Não informado'}</dd></div><div><dt>Contato</dt><dd>{fornecedor?.contato || 'Não informado'}</dd></div></dl></Card>
      <Card><span className="dashboard-card-label">Acompanhamento</span><h3>Próximos agendamentos</h3>{agendamentos.length === 0 ? <p className="dashboard-empty">Os agendamentos criados neste navegador aparecerão aqui.</p> : <div className="dashboard-appointments">{agendamentos.slice(0, 3).map((item) => <Link className="dashboard-appointment" to={`/agendamentos/${item.id_agendamento}`} key={item.id_agendamento}><span><strong>{new Date(item.data_agendada).toLocaleDateString('pt-BR')}</strong><small>{item.horario_agendado} · {item.tipo_acondicionamento}</small></span><StatusBadge status={item.status_agendamento} /></Link>)}</div>}</Card>
    </div>
  </div>;
}
