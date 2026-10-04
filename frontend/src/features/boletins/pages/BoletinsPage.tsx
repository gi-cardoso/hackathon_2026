import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Breadcrumb } from '../../../components/Breadcrumb';
import { PageContent } from '../../../components/layout/PageContent';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import {
  createBoletim,
  getApiError,
  getChapas,
  tiposItemBoletim,
} from '../../../services/api';
import type { TipoItemBoletim, ChapaResponse } from '../../../services/api';
import './styles.css';

type ProductionField = {
  id: number;
  tipoItem: string;
  descarga: string;
  remocao: string;
  transferencia: string;
};

type TeamField = {
  id: number;
  matricula: string;
  jornada: '' | 'COMPLETA' | 'MEIA';
};

const initialProduction: ProductionField = {
  id: 1,
  tipoItem: '',
  descarga: '',
  remocao: '',
  transferencia: '',
};

const initialTeam: TeamField = {
  id: 1,
  matricula: '',
  jornada: '',
};

function labelize(value: string) {
  return value.toLowerCase().replaceAll('_', ' ');
}

function parseQuantity(value: string) {
  if (value.trim() === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function BoletinsPage() {
  const [production, setProduction] = useState<ProductionField[]>([]);
  const [team, setTeam] = useState<TeamField[]>([]);
  const [date, setDate] = useState('');
  const [responsibleId, setResponsibleId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [chapas, setChapas] = useState<ChapaResponse[]>([]);

  useEffect(() => {
    let active = true;
    setError('');
    getChapas().then((chapasResponse) => {
      if (!active) return;
      setChapas(chapasResponse.filter(u => u.ativo));
    }).catch((requestError: unknown) => {
      if (active) setError(getApiError(requestError));
    });
    return () => { active = false; };
  }, []);

  const updateProduction = (fieldId: number, field: keyof Omit<ProductionField, 'id'>, value: string) => {
    setProduction((current) => current.map((item) => item.id === fieldId ? { ...item, [field]: value } : item));
  };

  const updateTeam = (fieldId: number, field: keyof Omit<TeamField, 'id'>, value: string) => {
    setTeam((current) => current.map((member) => member.id === fieldId ? { ...member, [field]: value } : member));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!date || production.length === 0 || team.length === 0) {
      setError('Informe a data, pelo menos um item de produção e um membro da equipe.');
      return;
    }
    if (team.length > 20) {
      setError('O boletim não pode possuir mais de 20 membros na equipe.');
      return;
    }

    const productionPayload = production.map((item) => ({
      tipoItem: item.tipoItem as TipoItemBoletim,
      descarga: parseQuantity(item.descarga) as number,
      remocao: parseQuantity(item.remocao) as number,
      transferencia: parseQuantity(item.transferencia) as number,
    }));
    if (productionPayload.some((item) => !item.tipoItem || item.descarga === null || item.remocao === null || item.transferencia === null || (item.descarga === 0 && item.remocao === 0 && item.transferencia === 0))) {
      setError('Cada item deve ter um tipo válido, quantidades não negativas e alguma movimentação.');
      return;
    }

    const teamPayload = team.map((member) => ({ matricula: member.matricula.trim(), jornada: member.jornada }));
    const hasDuplicateMatricula = new Set(teamPayload.map((member) => member.matricula)).size !== teamPayload.length;
    if (teamPayload.some((member) => !member.matricula || !member.jornada) || hasDuplicateMatricula) {
      setError('Informe matrículas únicas e uma jornada válida para toda a equipe.');
      return;
    }

    const parsedResponsibleId = responsibleId.trim() ? Number(responsibleId) : undefined;
    if (parsedResponsibleId !== undefined && (!Number.isInteger(parsedResponsibleId) || parsedResponsibleId <= 0)) {
      setError('O responsável informado deve ser um ID inteiro maior que zero.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createBoletim({
        data: date,
        responsavelId: parsedResponsibleId,
        producao: productionPayload,
        equipe: teamPayload as Array<{ matricula: string; jornada: 'COMPLETA' | 'MEIA' }>,
      });
      setProduction([]);
      setTeam([]);
      setDate('');
      setResponsibleId('');
      toast.success(response.mensagem);
    } catch (requestError: unknown) {
      setError(getApiError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return <><Breadcrumb items={[{ label: 'Início', path: '/boletim' }, { label: 'Boletim' }, { label: 'Publicações' }]} /><PageContent><div className="boletim-heading"><div><h2>Boletins</h2><p>Registre a produção diária de um armazém.</p></div></div>{error && <div className="internal-alert" role="alert">{error}</div>}<Card><form className="boletim-form" onSubmit={submit}><div className="boletim-form-grid"><label>Data do boletim<DatePicker selected={date ? new Date(`${date}T00:00:00`) : null} onChange={(d: Date | null) => { if (d) setDate(d.toISOString().split('T')[0]); else setDate(''); }} dateFormat="dd/MM/yyyy" placeholderText="Selecione uma data" className="ui-input" required /></label><label>Responsável (ID opcional)<Input type="number" min="1" step="1" value={responsibleId} onChange={(event) => setResponsibleId(event.target.value)} /><small>O backend aceita esse identificador no corpo da requisição.</small></label></div><div className="boletim-section-heading"><div><h3>Produção</h3><p>Use os tipos e quantidades aceitos pelo backend.</p></div><Button type="button" variant="ghost" onClick={() => setProduction((current) => [...current, { ...initialProduction, id: Date.now() }])}>Adicionar item</Button></div>{production.length === 0 && <p className="boletim-muted">Nenhum item adicionado.</p>}<div className="boletim-row-list">{production.map((item) => <div className="boletim-production-row" key={item.id}><label>Tipo<select className="ui-select" value={item.tipoItem} onChange={(event) => updateProduction(item.id, 'tipoItem', event.target.value)}><option value="">Selecione</option>{tiposItemBoletim.map((type) => <option value={type} key={type}>{labelize(type)}</option>)}</select></label><label>Descarga<Input type="number" min="0" step="any" value={item.descarga} onChange={(event) => updateProduction(item.id, 'descarga', event.target.value)} /></label><label>Remoção<Input type="number" min="0" step="any" value={item.remocao} onChange={(event) => updateProduction(item.id, 'remocao', event.target.value)} /></label><label>Transferência<Input type="number" min="0" step="any" value={item.transferencia} onChange={(event) => updateProduction(item.id, 'transferencia', event.target.value)} /></label><Button type="button" variant="danger" onClick={() => setProduction((current) => current.filter((entry) => entry.id !== item.id))}>Remover</Button></div>)}</div><div className="boletim-section-heading"><div><h3>Equipe</h3><p>Informe as matrículas existentes e a jornada de cada membro.</p></div><Button type="button" variant="ghost" onClick={() => setTeam((current) => [...current, { ...initialTeam, id: Date.now() }])}>Adicionar membro</Button></div>{team.length === 0 && <p className="boletim-muted">Nenhum membro adicionado.</p>}<div className="boletim-row-list">{team.map((member) => <div className="boletim-team-row" key={member.id}><label>Matrícula (Chapa)<select className="ui-select" value={member.matricula} onChange={(event) => updateTeam(member.id, 'matricula', event.target.value)}><option value="">Selecione</option>{chapas.map((chapa) => <option key={chapa.matricula} value={chapa.matricula}>{chapa.nome} ({chapa.matricula})</option>)}</select></label><label>Jornada<select className="ui-select" value={member.jornada} onChange={(event) => updateTeam(member.id, 'jornada', event.target.value)}><option value="">Selecione</option><option value="COMPLETA">Completa</option><option value="MEIA">Meia</option></select></label><Button type="button" variant="danger" onClick={() => setTeam((current) => current.filter((entry) => entry.id !== member.id))}>Remover</Button></div>)}</div><div className="boletim-actions"><Button type="submit" loading={submitting}>Salvar boletim</Button></div></form></Card></PageContent></>;
}
