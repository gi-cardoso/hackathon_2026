import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumb } from '../../../components/Breadcrumb';
import { PageContent } from '../../../components/layout/PageContent';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { api } from '../../../services/api';
import '../styles.css';

interface NotaFiscal {
  id_nota: number;
  numero_nf?: string | null;
  serie?: string | null;
  natureza_operacao?: string | null;
  tipo_operacao?: string | null;
  data_emissao?: string | null;
  chave_acesso?: string | null;
  tipo_arquivo?: string | null;
  nome_arquivo?: string | null;
  mime_type?: string | null;
  tamanho_bytes?: number | null;
  caminho_arquivo?: string | null;
  arquivo_nf?: string | null;
  dados_completos?: {
    emitente?: { razaoSocial?: string; cnpjCpf?: string };
    totais?: {
      valorNota?: number;
      valorProdutos?: number;
      valorIcms?: number;
      valorIpi?: number;
      valorPis?: number;
      valorCofins?: number;
    };
  } | null;
}

interface AgendamentoDetail {
  id_agendamento: number;
  data_agendada: string;
  horario_agendado: string;
  tipo_acondicionamento: string;
  status_agendamento: string;
  motivo_cancelamento?: string | null;
  motivo_reagendamento?: string | null;
  fornecedor?: { nome_fornecedor?: string; cnpj?: string | null };
  nota_fiscal?: NotaFiscal | null;
}

function formatCurrency(value?: number) {
  return value === undefined
    ? null
    : value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString('pt-BR') : null;
}

function formatFileSize(value?: number | null) {
  return value ? `${(value / 1024).toFixed(1)} KB` : null;
}

function getPdfUrl(notaFiscal: NotaFiscal) {
  const reference = notaFiscal.arquivo_nf || notaFiscal.caminho_arquivo;
  if (!reference) return null;
  if (/^https?:\/\//i.test(reference)) return reference;
  if (reference.startsWith('/')) return new URL(reference, window.location.origin).toString();
  return null;
}

function InvoiceCard({ notaFiscal }: { notaFiscal: NotaFiscal | null | undefined }) {
  const [pdfError, setPdfError] = useState(false);

  if (!notaFiscal) {
    return <Card><h3>Nota fiscal</h3><p className="invoice-unavailable">Não há nota fiscal associada a este agendamento.</p></Card>;
  }

  const pdfUrl = getPdfUrl(notaFiscal);
  const totals = notaFiscal.dados_completos?.totais;
  const pdfIsAvailable = Boolean(pdfUrl && !pdfError);

  return (
    <Card className="invoice-card">
      <div className="invoice-card-heading">
        <div>
          <span className="card-kicker">Documento associado</span>
          <h3>Nota fiscal</h3>
        </div>
        <span className="ui-status ui-status-pendente">NF #{notaFiscal.id_nota}</span>
      </div>

      <div className="invoice-section">
        <h4>Identificação</h4>
        <dl className="detail-list">
          {notaFiscal.numero_nf && <div><dt>Número</dt><dd>{notaFiscal.numero_nf}</dd></div>}
          {notaFiscal.serie && <div><dt>Série</dt><dd>{notaFiscal.serie}</dd></div>}
          {formatDate(notaFiscal.data_emissao) && <div><dt>Data de emissão</dt><dd>{formatDate(notaFiscal.data_emissao)}</dd></div>}
          {(notaFiscal.natureza_operacao || notaFiscal.tipo_operacao) && <div><dt>Operação</dt><dd>{notaFiscal.natureza_operacao || notaFiscal.tipo_operacao}</dd></div>}
          {notaFiscal.chave_acesso && <div><dt>Chave de acesso</dt><dd className="invoice-value-break">{notaFiscal.chave_acesso}</dd></div>}
        </dl>
      </div>

      {(notaFiscal.dados_completos?.emitente || totals) && <div className="invoice-section">
        <h4>Dados fiscais</h4>
        <dl className="detail-list">
          {notaFiscal.dados_completos?.emitente?.razaoSocial && <div><dt>Emitente</dt><dd>{notaFiscal.dados_completos.emitente.razaoSocial}</dd></div>}
          {notaFiscal.dados_completos?.emitente?.cnpjCpf && <div><dt>CNPJ/CPF emitente</dt><dd>{notaFiscal.dados_completos.emitente.cnpjCpf}</dd></div>}
          {formatCurrency(totals?.valorNota) && <div><dt>Valor total</dt><dd>{formatCurrency(totals?.valorNota)}</dd></div>}
          {formatCurrency(totals?.valorProdutos) && <div><dt>Valor dos produtos</dt><dd>{formatCurrency(totals?.valorProdutos)}</dd></div>}
          {formatCurrency(totals?.valorIcms) && <div><dt>ICMS</dt><dd>{formatCurrency(totals?.valorIcms)}</dd></div>}
          {formatCurrency(totals?.valorIpi) && <div><dt>IPI</dt><dd>{formatCurrency(totals?.valorIpi)}</dd></div>}
          {formatCurrency(totals?.valorPis) && <div><dt>PIS</dt><dd>{formatCurrency(totals?.valorPis)}</dd></div>}
          {formatCurrency(totals?.valorCofins) && <div><dt>COFINS</dt><dd>{formatCurrency(totals?.valorCofins)}</dd></div>}
        </dl>
      </div>}

      <div className="invoice-section">
        <h4>Arquivo da nota</h4>
        {(notaFiscal.nome_arquivo || notaFiscal.tipo_arquivo || notaFiscal.mime_type || notaFiscal.tamanho_bytes) && <dl className="detail-list">
          {notaFiscal.nome_arquivo && <div><dt>Nome</dt><dd className="invoice-value-break">{notaFiscal.nome_arquivo}</dd></div>}
          {notaFiscal.tipo_arquivo && <div><dt>Tipo</dt><dd>{notaFiscal.tipo_arquivo}</dd></div>}
          {notaFiscal.mime_type && <div><dt>Formato</dt><dd>{notaFiscal.mime_type}</dd></div>}
          {formatFileSize(notaFiscal.tamanho_bytes) && <div><dt>Tamanho</dt><dd>{formatFileSize(notaFiscal.tamanho_bytes)}</dd></div>}
        </dl>}
        {pdfIsAvailable ? <>
          <div className="invoice-viewer-actions"><a className="ui-button ui-button-secondary" href={pdfUrl || undefined} target="_blank" rel="noreferrer">Abrir PDF em nova aba</a></div>
          <iframe className="invoice-pdf-viewer" title={`Nota fiscal ${notaFiscal.numero_nf || notaFiscal.id_nota}`} src={pdfUrl || undefined} onError={() => setPdfError(true)} />
        </> : <p className="invoice-unavailable">O backend não retornou uma URL visualizável para o PDF desta nota.</p>}
      </div>
    </Card>
  );
}

export function AgendamentoDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<AgendamentoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setItem(null);
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
        <span className="page-eyebrow">Análise de Compras</span>
        <h2>Agendamento #{id}</h2>
        {message && <div className={`internal-alert ${message.includes('aprovado') || message.includes('rejeitado') ? 'is-success' : ''}`} role="status">{message}</div>}
        {loading && <Card><p>Carregando dados do agendamento...</p></Card>}
        {!loading && item && <div className="detail-grid">
          <Card>
            <div className="agendamento-card-top"><div><span className="card-kicker">Fornecedor</span><h3>{item.fornecedor?.nome_fornecedor || 'Não informado'}</h3></div><StatusBadge status={item.status_agendamento} /></div>
            <dl className="detail-list"><div><dt>CNPJ</dt><dd>{item.fornecedor?.cnpj || 'Não informado'}</dd></div><div><dt>Entrega</dt><dd>{new Date(item.data_agendada).toLocaleDateString('pt-BR')} às {item.horario_agendado}</dd></div><div><dt>Acondicionamento</dt><dd>{item.tipo_acondicionamento}</dd></div><div><dt>Nota fiscal</dt><dd>{item.nota_fiscal?.numero_nf || 'Não vinculada'}</dd></div>{item.motivo_reagendamento && <div><dt>Motivo Reagendamento</dt><dd>{item.motivo_reagendamento}</dd></div>}{item.motivo_cancelamento && <div><dt>Motivo Cancelamento</dt><dd>{item.motivo_cancelamento}</dd></div>}</dl>
          </Card>
          <InvoiceCard notaFiscal={item.nota_fiscal} />
          <Card><h3>Decisão</h3><p>Registre a análise do pedido para liberar o próximo passo operacional.</p><div className="detail-actions"><Button variant="secondary" onClick={() => void decide('APROVADO')} disabled={item.status_agendamento !== 'PENDENTE' && item.status_agendamento !== 'REAGENDADO'}>Aprovar</Button><Button variant="danger" onClick={() => void decide('REJEITADO')} disabled={item.status_agendamento !== 'PENDENTE' && item.status_agendamento !== 'REAGENDADO'}>Rejeitar</Button></div></Card>
        </div>}
        <Link className="agendamentos-back-link" to="/agendamentos/lista">Voltar para a lista</Link>
      </PageContent>
    </>
  );
}