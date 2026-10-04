import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Breadcrumb } from '../../../components/Breadcrumb';
import { PageContent } from '../../../components/layout/PageContent';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import {
  createRecebimento,
  getApiError,
  getRecebimento,
} from '../../../services/api';
import type { RecebimentoPayload, RecebimentoResponse } from '../../../services/api';
import './styles.css';

type EquipmentField = {
  id: number;
  id_tipo_equipamento: string;
  quantidade_utilizada: string;
};

type FormState = Omit<RecebimentoPayload, 'id_agendamento' | 'id_armazem' | 'qtd_chapas_utilizados' | 'equipamentos'> & {
  id_agendamento: string;
  id_armazem: string;
  qtd_chapas_utilizados: string;
};

const initialForm: FormState = {
  id_agendamento: '',
  id_armazem: '',
  hora_chegada: '',
  hora_entrada: '',
  hora_saida: '',
  qtd_chapas_utilizados: '',
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR');
}

function parsePositiveInteger(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function RegistrarRecebimentoPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [equipamentos, setEquipamentos] = useState<EquipmentField[]>([]);
  const [created, setCreated] = useState<RecebimentoResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateForm = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateEquipment = (id: number, field: keyof Omit<EquipmentField, 'id'>, value: string) => {
    setEquipamentos((current) => current.map((equipment) => equipment.id === id ? { ...equipment, [field]: value } : equipment));
  };

  const addEquipment = () => {
    setEquipamentos((current) => [...current, {
      id: Date.now(),
      id_tipo_equipamento: '',
      quantidade_utilizada: '',
    }]);
  };

  const removeEquipment = (id: number) => {
    setEquipamentos((current) => current.filter((equipment) => equipment.id !== id));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const idAgendamento = parsePositiveInteger(form.id_agendamento);
    const idArmazem = parsePositiveInteger(form.id_armazem);
    const qtdChapas = parsePositiveInteger(form.qtd_chapas_utilizados);
    if (!idAgendamento || !idArmazem || !qtdChapas || !form.hora_chegada || !form.hora_entrada || !form.hora_saida) {
      setError('Preencha os campos obrigatórios com valores válidos.');
      return;
    }

    const hasIncompleteEquipment = equipamentos.some((equipment) => Boolean(equipment.id_tipo_equipamento) !== Boolean(equipment.quantidade_utilizada));
    if (hasIncompleteEquipment) {
      setError('Preencha o equipamento e a quantidade utilizada ou remova a linha.');
      return;
    }

    const equipmentPayload = equipamentos.map((equipment) => ({
      id_tipo_equipamento: parsePositiveInteger(equipment.id_tipo_equipamento),
      quantidade_utilizada: parsePositiveInteger(equipment.quantidade_utilizada),
    }));
    if (equipmentPayload.some((equipment) => !equipment.id_tipo_equipamento || !equipment.quantidade_utilizada)) {
      setError('Os equipamentos e as quantidades utilizadas devem ser inteiros maiores que zero.');
      return;
    }

    setLoading(true);
    try {
      const response = await createRecebimento({
        id_agendamento: idAgendamento,
        id_armazem: idArmazem,
        hora_chegada: form.hora_chegada,
        hora_entrada: form.hora_entrada,
        hora_saida: form.hora_saida,
        qtd_chapas_utilizados: qtdChapas,
        equipamentos: equipmentPayload,
      });
      setCreated(response);
      toast.success('Recebimento registrado com sucesso.');
    } catch (requestError: unknown) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm(initialForm);
    setEquipamentos([]);
    setCreated(null);
    setError('');
  };

  return (
    <>
      <Breadcrumb items={[{ label: 'Início', path: '/armazem' }, { label: 'Armazém' }, { label: 'Recebimentos' }]} />
      <PageContent>
        <div className="recebimento-heading">
          <div>
            <span className="page-eyebrow">Operação de armazém</span>
            <h2>Registrar recebimento</h2>
            <p>Registre a operação de um agendamento aprovado com os dados observados no armazém.</p>
          </div>
        </div>
        {error && <div className="internal-alert" role="alert">{error}</div>}
        {created ? <Card className="recebimento-success-card">
          <span className="card-kicker">Operação registrada</span>
          <h3>Recebimento #{created.id_recebimento}</h3>
          <p>O recebimento foi persistido com status {created.status_recebimento}.</p>
          <div className="recebimento-actions">
            <Link className="ui-button ui-button-secondary" to={`/recebimentos/${created.id_recebimento}`}>Ver detalhes</Link>
            <Button type="button" variant="ghost" onClick={reset}>Registrar outro</Button>
          </div>
        </Card> : <Card>
          <form className="recebimento-form" onSubmit={submit}>
            <div className="recebimento-form-grid">
              <label>Agendamento
                <Input type="number" min="1" value={form.id_agendamento} onChange={(event) => updateForm('id_agendamento', event.target.value)} required />
                <small>Use um agendamento com status aprovado.</small>
              </label>
              <label>Armazém
                <Input type="number" min="1" value={form.id_armazem} onChange={(event) => updateForm('id_armazem', event.target.value)} required />
              </label>
              <label>Hora de chegada
                <Input type="datetime-local" value={form.hora_chegada} onChange={(event) => updateForm('hora_chegada', event.target.value)} required />
              </label>
              <label>Hora de entrada
                <Input type="datetime-local" value={form.hora_entrada} onChange={(event) => updateForm('hora_entrada', event.target.value)} required />
              </label>
              <label>Hora de saída
                <Input type="datetime-local" value={form.hora_saida} onChange={(event) => updateForm('hora_saida', event.target.value)} required />
              </label>
              <label>Chapas utilizadas
                <Input type="number" min="1" step="1" value={form.qtd_chapas_utilizados} onChange={(event) => updateForm('qtd_chapas_utilizados', event.target.value)} required />
              </label>
            </div>
            <div className="recebimento-section-heading">
              <div><h3>Equipamentos</h3><p>Informe os IDs e as quantidades utilizadas na descarga.</p></div>
              <Button type="button" variant="ghost" onClick={addEquipment}>Adicionar equipamento</Button>
            </div>
            {equipamentos.length === 0 && <p className="recebimento-muted">Nenhum equipamento informado.</p>}
            <div className="recebimento-equipment-list">
              {equipamentos.map((equipment) => <div className="recebimento-equipment-row" key={equipment.id}>
                <label>ID do equipamento
                  <Input type="number" min="1" step="1" value={equipment.id_tipo_equipamento} onChange={(event) => updateEquipment(equipment.id, 'id_tipo_equipamento', event.target.value)} />
                </label>
                <label>Quantidade utilizada
                  <Input type="number" min="1" step="1" value={equipment.quantidade_utilizada} onChange={(event) => updateEquipment(equipment.id, 'quantidade_utilizada', event.target.value)} />
                </label>
                <Button type="button" variant="danger" onClick={() => removeEquipment(equipment.id)}>Remover</Button>
              </div>)}
            </div>
            <div className="recebimento-actions"><Button type="submit" loading={loading}>Registrar recebimento</Button></div>
          </form>
        </Card>}
      </PageContent>
    </>
  );
}

export function RecebimentoDetailPage() {
  const { id } = useParams();
  const [recebimento, setRecebimento] = useState<RecebimentoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const recebimentoId = Number(id);

  useEffect(() => {
    if (!Number.isInteger(recebimentoId) || recebimentoId <= 0) {
      setError('ID do recebimento inválido.');
      setLoading(false);
      return;
    }

    let active = true;
    getRecebimento(recebimentoId)
      .then((response) => { if (active) setRecebimento(response); })
      .catch((requestError: unknown) => { if (active) setError(getApiError(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [recebimentoId]);

  return (
    <>
      <Breadcrumb items={[{ label: 'Início', path: '/armazem' }, { label: 'Armazém' }, { label: 'Recebimento' }]} />
      <PageContent>
        <div className="recebimento-heading"><div><span className="page-eyebrow">Operação de armazém</span><h2>Detalhes do recebimento</h2><p>Consulta do recebimento #{id || 'selecionado'} no sistema.</p></div><Link className="ui-button ui-button-ghost" to="/recebimentos">Novo recebimento</Link></div>
        {loading && <Card><p>Carregando dados do recebimento...</p></Card>}
        {error && <div className="internal-alert" role="alert">{error}</div>}
        {!loading && !error && recebimento && <div className="recebimento-detail-grid">
          <Card><span className="card-kicker">Recebimento #{recebimento.id_recebimento}</span><h3>Operação finalizada</h3><span className="ui-status ui-status-concluido">{recebimento.status_recebimento}</span><dl className="detail-list"><div><dt>Agendamento</dt><dd>#{recebimento.id_agendamento}</dd></div><div><dt>Fornecedor</dt><dd>{recebimento.agendamento?.fornecedor?.nome_fornecedor || 'Não informado'}</dd></div><div><dt>Chegada</dt><dd>{formatDateTime(recebimento.hora_chegada)}</dd></div><div><dt>Entrada</dt><dd>{formatDateTime(recebimento.hora_entrada)}</dd></div><div><dt>Saída</dt><dd>{formatDateTime(recebimento.hora_saida)}</dd></div></dl></Card>
          {recebimento.descargas.map((descarga) => <Card key={descarga.id_descarga}><span className="card-kicker">Descarga #{descarga.id_descarga}</span><h3>{descarga.armazem?.nome_armazem || `Armazém #${descarga.id_armazem || 'não informado'}`}</h3><dl className="detail-list"><div><dt>Chapas utilizadas</dt><dd>{descarga.qtd_chapas_utilizados}</dd></div></dl>{descarga.equipamentos.length > 0 && <div className="recebimento-equipment-summary"><h4>Equipamentos</h4>{descarga.equipamentos.map((equipment) => <div key={equipment.id_tipo_equipamento}><span>{equipment.equipamento?.nome || `Equipamento #${equipment.id_tipo_equipamento}`}</span><strong>{equipment.quantidade_utilizada}</strong></div>)}</div>}</Card>)}
        </div>}
      </PageContent>
    </>
  );
}
