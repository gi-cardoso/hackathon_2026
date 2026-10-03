import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumb } from '../../../components/Breadcrumb';
import { PageContent } from '../../../components/layout/PageContent';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { api } from '../../../services/api';
import '../styles.css';

interface AgendamentoDetail {
  id_agendamento: number;
  data_agendada: string;
  horario_agendado: string;
  tipo_acondicionamento: string;
  status_agendamento: string;
  fornecedor?: { nome_fornecedor?: string; cnpj?: string | null };
  nota_fiscal?: { numero_nf?: string; chave_acesso?: string } | null;
}

export function AgendamentoDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<AgendamentoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    api.get<AgendamentoDetail>(`/agendamentos/analise/compras/${id}`)
      .then((response) => setItem(response.data))
      .catch(() => setMessage('Não foi possível carregar este agendamento.'))
      .finally(() => setLoading(false));
  }, [id]);

  const decide = async (decision: 'APROVADO' | 'REJEITADO') => {
    if (!id) return;
    setMessage('Enviando decisão...');
    try {
      const response = await api.patch<AgendamentoDetail>(`/agendamentos/analise/compras/${id}/decisao`, { decisao: decision });
      setItem(response.data);
      setMessage(`Agendamento ${decision === 'APROVADO' ? 'aprovado' : 'rejeitado'}.`);
    } catch {
      setMessage('Não foi possível registrar a decisão.');
    }
  };

  return (
    <>
      <Breadcrumb items={[{ label: 'Início', path: '/agendamentos' }, { label: 'Agendamentos', path: '/agendamentos/lista' }, { label: 'Detalhes' }]} />
      <PageContent>
        <span className="page-eyebrow">Análise de Compras</span><h2>Agendamento #{id}</h2>
        {message && <div className="internal-alert" role="status">{message}</div>}
        {loading && <Card><p>Carregando dados do agendamento...</p></Card>}
        {!loading && item && <div className="detail-grid"><Card><div className="agendamento-card-top"><div><span className="card-kicker">Fornecedor</span><h3>{item.fornecedor?.nome_fornecedor || 'Não informado'}</h3></div><StatusBadge status={item.status_agendamento} /></div><dl className="detail-list"><div><dt>CNPJ</dt><dd>{item.fornecedor?.cnpj || 'Não informado'}</dd></div><div><dt>Entrega</dt><dd>{new Date(item.data_agendada).toLocaleDateString('pt-BR')} às {item.horario_agendado}</dd></div><div><dt>Acondicionamento</dt><dd>{item.tipo_acondicionamento}</dd></div><div><dt>Nota fiscal</dt><dd>{item.nota_fiscal?.numero_nf || 'Não vinculada'}</dd></div></dl></Card><Card><h3>Decisão</h3><p>Registre a análise do pedido para liberar o próximo passo operacional.</p><div className="detail-actions"><Button variant="secondary" onClick={() => void decide('APROVADO')} disabled={item.status_agendamento !== 'PENDENTE'}>Aprovar</Button><Button variant="danger" onClick={() => void decide('REJEITADO')} disabled={item.status_agendamento !== 'PENDENTE'}>Rejeitar</Button></div></Card></div>}
        <Link className="agendamentos-back-link" to="/agendamentos/lista">Voltar para a lista</Link>
      </PageContent>
    </>
  );
}
