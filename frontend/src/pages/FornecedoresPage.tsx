import { useEffect, useMemo, useState } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { PageContent } from '../components/layout/PageContent';
import { Skeleton } from '../components/ui/Skeleton';
import { api, getApiError } from '../services/api';
import './ModuleStatusPage.css';
import '../features/agendamentos/styles.css';

interface Fornecedor {
  id_fornecedor: number;
  codigo_fornecedor_cocapec: string | null;
  nome_fornecedor: string;
  cnpj: string | null;
  contato: string | null;
  ativo: boolean;
}

type StatusFiltro = 'TODOS' | 'ATIVOS' | 'INATIVOS';

export function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [status, setStatus] = useState<StatusFiltro>('TODOS');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setFornecedores([]);
    setError('');
    setLoading(true);

    api.get<Fornecedor[]>('/fornecedores')
      .then((response) => {
        if (active) setFornecedores(Array.isArray(response.data) ? response.data : []);
      })
      .catch((requestError: unknown) => {
        if (active) setError(getApiError(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredFornecedores = useMemo(
    () => status === 'TODOS'
      ? fornecedores
      : fornecedores.filter((fornecedor) => status === 'ATIVOS' ? fornecedor.ativo : !fornecedor.ativo),
    [fornecedores, status],
  );

  return (
    <>
      <Breadcrumb items={[{ label: 'Início', path: '/compras' }, { label: 'Compras' }, { label: 'Fornecedores' }]} />
      <PageContent>
        <div className="page-heading-row">
          <div>
            <h2>Fornecedores</h2>
            <p className="agendamentos-intro">Fornecedores cadastrados no sistema.</p>
          </div>
          <label className="filter-control">Status<select value={status} onChange={(event) => setStatus(event.target.value as StatusFiltro)}><option value="TODOS">Todos</option><option value="ATIVOS">Ativos</option><option value="INATIVOS">Inativos</option></select></label>
        </div>

        {error && <div className="internal-alert" role="alert">{error}</div>}
        {loading && <div className="internal-card-list"><Card><Skeleton className="skeleton-line" /><Skeleton className="skeleton-line short" /></Card><Card><Skeleton className="skeleton-line" /><Skeleton className="skeleton-line short" /></Card></div>}
        {!loading && !error && filteredFornecedores.length === 0 && <EmptyState title="Nenhum fornecedor encontrado" description="Os fornecedores cadastrados aparecerão aqui." />}
        {!loading && !error && filteredFornecedores.length > 0 && <div className="internal-card-list">{filteredFornecedores.map((fornecedor) => <Card key={fornecedor.id_fornecedor} className="agendamento-card"><div className="agendamento-card-top"><div><span className="card-kicker">Fornecedor #{fornecedor.id_fornecedor}</span><h3>{fornecedor.nome_fornecedor}</h3></div><span className={`ui-status ui-status-${fornecedor.ativo ? 'ativo' : 'inativo'}`}>{fornecedor.ativo ? 'Ativo' : 'Inativo'}</span></div><dl className="detail-list"><div><dt>Código COCAPEC</dt><dd>{fornecedor.codigo_fornecedor_cocapec || 'Não informado'}</dd></div><div><dt>CNPJ</dt><dd>{fornecedor.cnpj || 'Não informado'}</dd></div><div><dt>Contato</dt><dd>{fornecedor.contato || 'Não informado'}</dd></div></dl></Card>)}</div>}
      </PageContent>
    </>
  );
}