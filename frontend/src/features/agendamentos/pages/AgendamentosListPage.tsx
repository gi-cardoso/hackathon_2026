import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../../../components/Breadcrumb';
import { PageContent } from '../../../components/layout/PageContent';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { api } from '../../../services/api';
import '../styles.css';

interface AgendamentoItem {
  id_agendamento: number;
  data_agendada: string;
  horario_agendado: string;
  tipo_acondicionamento: string;
  status_agendamento: string;
  fornecedor?: { nome_fornecedor?: string; cnpj?: string | null };
}

export function AgendamentosListPage() {
  const [items, setItems] = useState<AgendamentoItem[]>([]);
  const [status, setStatus] = useState('TODOS');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<AgendamentoItem[]>('/agendamentos/analise/compras')
      .then((response) => setItems(response.data))
      .catch(() => setError('Não foi possível carregar os agendamentos de Compras.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => status === 'TODOS' ? items : items.filter((item) => item.status_agendamento === status), [items, status]);

  return (
    <>
      <Breadcrumb items={[{ label: 'Início', path: '/agendamentos' }, { label: 'Agendamentos' }, { label: 'Lista de agendamentos' }]} />
      <PageContent>
        <div className="page-heading-row"><div><span className="page-eyebrow">Compras / operação</span><h2>Agendamentos para análise</h2><p className="agendamentos-intro">Pedidos pendentes enviados pelos fornecedores.</p></div><label className="filter-control">Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="TODOS">Todos</option><option value="PENDENTE">Pendentes</option><option value="APROVADO">Aprovados</option><option value="REJEITADO">Rejeitados</option></select></label></div>
        {error && <div className="internal-alert" role="alert">{error}</div>}
        {loading && <div className="internal-card-list"><Card><Skeleton className="skeleton-line" /><Skeleton className="skeleton-line short" /></Card><Card><Skeleton className="skeleton-line" /><Skeleton className="skeleton-line short" /></Card></div>}
        {!loading && !error && filteredItems.length === 0 && <EmptyState title="Nenhum agendamento encontrado" description="Quando houver pedidos pendentes, eles aparecerão aqui para análise." />}
        {!loading && filteredItems.length > 0 && <div className="internal-card-list">{filteredItems.map((item) => <Card key={item.id_agendamento} className="agendamento-card"><div className="agendamento-card-top"><div><span className="card-kicker">Pedido #{item.id_agendamento}</span><h3>{item.fornecedor?.nome_fornecedor || 'Fornecedor não informado'}</h3></div><StatusBadge status={item.status_agendamento} /></div><div className="agendamento-meta"><span><strong>{new Date(item.data_agendada).toLocaleDateString('pt-BR')}</strong> às {item.horario_agendado}</span><span>{item.tipo_acondicionamento}</span></div><Link className="internal-link" to={`/agendamentos/${item.id_agendamento}`}>Abrir análise</Link></Card>)}</div>}
      </PageContent>
    </>
  );
}
