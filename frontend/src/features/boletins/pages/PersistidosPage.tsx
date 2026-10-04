import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumb } from '../../../components/Breadcrumb';
import { PageContent } from '../../../components/layout/PageContent';
import { Card } from '../../../components/ui/Card';
import {
  getApiError,
  getBoletim,
  getBoletins,
} from '../../../services/api';
import type { BoletimResponse } from '../../../services/api';
import './styles.css';

function formatDecimal(value: number | string) {
  return Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
}

function formatDate(value: string) {
  const [year, month, day] = value.substring(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

function labelize(value: string) {
  return value.toLowerCase().replaceAll('_', ' ');
}

function BoletimSummary({ boletim }: { boletim: BoletimResponse }) {
  return <Card className="boletim-card">
    <div className="boletim-card-heading"><div><span className="card-kicker">Boletim #{boletim.id_boletim}</span><h3>{formatDate(boletim.data)}</h3></div><span className="ui-status ui-status-aprovado">Registrado</span></div>
    <dl className="detail-list"><div><dt>Armazém</dt><dd>{boletim.armazem?.nome_armazem || `ID ${boletim.id_armazem ?? 'não informado'}`}</dd></div><div><dt>Produção</dt><dd>{formatDecimal(boletim.valor_produzido_total)}</dd></div><div><dt>Diárias equivalentes</dt><dd>{formatDecimal(boletim.diarias_equivalentes_total)}</dd></div><div><dt>Equipe</dt><dd>{boletim.equipes.length} membro(s)</dd></div></dl>
    <Link className="boletim-card-link" to={`/boletim/persistidos/${boletim.id_boletim}`}>Ver detalhes</Link>
  </Card>;
}

function BoletimDetail({ boletim }: { boletim: BoletimResponse }) {
  return <div className="boletim-detail-grid">
    <Card><span className="card-kicker">Boletim #{boletim.id_boletim}</span><h3>{formatDate(boletim.data)}</h3><dl className="detail-list"><div><dt>Armazém</dt><dd>{boletim.armazem?.nome_armazem || `ID ${boletim.id_armazem ?? 'não informado'}`}</dd></div><div><dt>Responsável informado</dt><dd>{boletim.responsavel_id ?? 'Não informado'}</dd></div><div><dt>Produção total</dt><dd>{formatDecimal(boletim.valor_produzido_total)}</dd></div><div><dt>Complemento de diária</dt><dd>{formatDecimal(boletim.complemento_diaria_pago)}</dd></div></dl></Card>
    <Card><h3>Itens de produção</h3><div className="boletim-data-list">{boletim.itens.map((item) => <div key={item.id_item_boletim}><span>{labelize(item.tipo_servico)}</span><strong>{formatDecimal(item.quantidade)}</strong></div>)}</div></Card>
    <Card><h3>Equipe</h3><div className="boletim-data-list">{boletim.equipes.map((member) => <div key={member.id}><span>{member.matricula_chapa || 'Matrícula não informada'}</span><strong>{member.tipo_jornada}</strong></div>)}</div></Card>
  </div>;
}

export function PersistidosPage() {
  const { id } = useParams();
  const [boletins, setBoletins] = useState<BoletimResponse[]>([]);
  const [boletim, setBoletim] = useState<BoletimResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const request = id ? getBoletim(Number(id)) : getBoletins();
    request.then((response) => {
      if (!active) return;
      if (id) setBoletim(response as BoletimResponse);
      else setBoletins(response as BoletimResponse[]);
    }).catch((requestError: unknown) => {
      if (active) setError(getApiError(requestError));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  if (id) {
    return <><Breadcrumb items={[{ label: 'Início', path: '/boletim' }, { label: 'Boletim' }, { label: 'Persistidos', path: '/boletim/persistidos' }, { label: `#${id}` }]} /><PageContent><div className="boletim-heading"><div><h2>Detalhes do boletim</h2><p>Consulta do boletim persistido no sistema.</p></div><Link className="ui-button ui-button-ghost" to="/boletim/persistidos">Voltar para persistidos</Link></div>{loading && <Card><p>Carregando boletim...</p></Card>}{error && <div className="internal-alert" role="alert">{error}</div>}{!loading && !error && boletim && <BoletimDetail boletim={boletim} />}</PageContent></>;
  }

  return <><Breadcrumb items={[{ label: 'Início', path: '/boletim' }, { label: 'Boletim' }, { label: 'Persistidos' }]} /><PageContent><div className="boletim-heading"><div><h2>Boletins persistidos</h2><p>Consulte os boletins já persistidos no sistema.</p></div></div>{error && <div className="internal-alert" role="alert">{error}</div>}{loading && <Card><p>Carregando boletins...</p></Card>}{!loading && !error && boletins.length === 0 && <Card><p className="boletim-muted">Nenhum boletim encontrado.</p></Card>}{!loading && !error && boletins.length > 0 && <div className="boletim-list">{boletins.map((item) => <BoletimSummary key={item.id_boletim} boletim={item} />)}</div>}</PageContent></>;
}
