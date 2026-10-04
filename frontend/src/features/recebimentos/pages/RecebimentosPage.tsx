import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Breadcrumb } from '../../../components/Breadcrumb';
import { PageContent } from '../../../components/layout/PageContent';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import {
  createRecebimento,
  getApiError,
  getRecebimento,
  getArmazens,
  getEquipamentos,
  getAgendamentosOperacao,
  getNaoRecebimentoMotivos,
  createNaoRecebimento,
} from '../../../services/api';
import type {
  RecebimentoPayload,
  RecebimentoResponse,
  Armazem,
  Equipamento,
  AgendamentoOperacao,
  NaoRecebimentoResponse,
} from '../../../services/api';
import './styles.css';

type EquipmentField = {
  id: number;
  id_tipo_equipamento: string;
  quantidade_utilizada: string;
};

type RecebimentoFormState = Omit<RecebimentoPayload, 'id_agendamento' | 'id_armazem' | 'qtd_chapas_utilizados' | 'equipamentos'> & {
  id_agendamento: string;
  id_armazem: string;
  qtd_chapas_utilizados: string;
};

const initialRecebimentoForm: RecebimentoFormState = {
  id_agendamento: '',
  id_armazem: '',
  hora_chegada: '',
  hora_entrada: '',
  hora_saida: '',
  qtd_chapas_utilizados: '',
};

type NaoRecebimentoFormState = {
  id_agendamento: string;
  motivo_padronizado: string;
  observacao: string;
};

const initialNaoRecebimentoForm: NaoRecebimentoFormState = {
  id_agendamento: '',
  motivo_padronizado: '',
  observacao: '',
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR');
}

function parsePositiveInteger(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function RegistrarRecebimentoPage() {
  const [operationType, setOperationType] = useState<'RECEBIMENTO' | 'NAO_RECEBIMENTO'>('RECEBIMENTO');

  // Dados para os Selects
  const [armazens, setArmazens] = useState<Armazem[]>([]);
  const [equipamentosOptions, setEquipamentosOptions] = useState<Equipamento[]>([]);
  const [agendamentos, setAgendamentos] = useState<AgendamentoOperacao[]>([]);
  const [motivos, setMotivos] = useState<string[]>([]);
  const [motivosObsObrigatoria, setMotivosObsObrigatoria] = useState<string[]>([]);

  // Estados dos formulários
  const [formRec, setFormRec] = useState<RecebimentoFormState>(initialRecebimentoForm);
  const [equipamentos, setEquipamentos] = useState<EquipmentField[]>([]);
  const [formNaoRec, setFormNaoRec] = useState<NaoRecebimentoFormState>(initialNaoRecebimentoForm);

  // Status e Respostas
  const [createdRec, setCreatedRec] = useState<RecebimentoResponse | null>(null);
  const [createdNaoRec, setCreatedNaoRec] = useState<NaoRecebimentoResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [armazensData, equipData, agendamentosData, motivosData] = await Promise.all([
          getArmazens(),
          getEquipamentos(),
          getAgendamentosOperacao('APROVADO'),
          getNaoRecebimentoMotivos(),
        ]);
        setArmazens(armazensData);
        setEquipamentosOptions(equipData);
        setAgendamentos(agendamentosData);
        setMotivos(motivosData.motivos);
        setMotivosObsObrigatoria(motivosData.observacao_obrigatoria_para);
      } catch (err) {
        toast.error('Erro ao carregar dados do sistema.');
        console.error(err);
      } finally {
        setFetchingData(false);
      }
    }
    loadData();
  }, []);

  const updateFormRec = (field: keyof RecebimentoFormState, value: string) => {
    setFormRec((current) => ({ ...current, [field]: value }));
  };

  const updateFormNaoRec = (field: keyof NaoRecebimentoFormState, value: string) => {
    setFormNaoRec((current) => ({ ...current, [field]: value }));
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

  const submitRecebimento = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const idAgendamento = parsePositiveInteger(formRec.id_agendamento);
    const idArmazem = parsePositiveInteger(formRec.id_armazem);
    const qtdChapas = parsePositiveInteger(formRec.qtd_chapas_utilizados);
    if (!idAgendamento || !idArmazem || !qtdChapas || !formRec.hora_chegada || !formRec.hora_entrada || !formRec.hora_saida) {
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
        hora_chegada: formRec.hora_chegada,
        hora_entrada: formRec.hora_entrada,
        hora_saida: formRec.hora_saida,
        qtd_chapas_utilizados: qtdChapas,
        equipamentos: equipmentPayload as any,
      });
      setCreatedRec(response);
      toast.success('Recebimento registrado com sucesso.');
    } catch (requestError: unknown) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  const submitNaoRecebimento = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const idAgendamento = parsePositiveInteger(formNaoRec.id_agendamento);
    if (!idAgendamento || !formNaoRec.motivo_padronizado) {
      setError('Preencha o agendamento e o motivo.');
      return;
    }

    if (motivosObsObrigatoria.includes(formNaoRec.motivo_padronizado) && !formNaoRec.observacao.trim()) {
      setError('A observação é obrigatória para o motivo selecionado.');
      return;
    }

    setLoading(true);
    try {
      const response = await createNaoRecebimento({
        id_agendamento: idAgendamento,
        motivo_padronizado: formNaoRec.motivo_padronizado,
        observacao: formNaoRec.observacao,
        data_registro: new Date().toISOString(),
      });
      setCreatedNaoRec(response);
      toast.success('Não recebimento registrado com sucesso.');
    } catch (requestError: unknown) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  const resetRec = () => {
    setFormRec(initialRecebimentoForm);
    setEquipamentos([]);
    setCreatedRec(null);
    setError('');
  };

  const resetNaoRec = () => {
    setFormNaoRec(initialNaoRecebimentoForm);
    setCreatedNaoRec(null);
    setError('');
  };

  if (fetchingData) {
    return (
      <>
        <Breadcrumb items={[{ label: 'Armazém', path: '/armazem' }, { label: 'Recebimentos' }]} />
        <PageContent>Carregando dados...</PageContent>
      </>
    );
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'Armazém', path: '/armazem' }, { label: 'Recebimentos' }]} />
      <PageContent>
        <div className="recebimento-heading">
          <div>
            
            <h2>Registrar operação</h2>
            <p>Registre a operação de um agendamento aprovado com os dados observados no armazém.</p>
          </div>
        </div>

        <div className="operation-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <Button
            type="button"
            variant={operationType === 'RECEBIMENTO' ? 'primary' : 'secondary'}
            onClick={() => { setOperationType('RECEBIMENTO'); setError(''); }}
          >
            Recebimento
          </Button>
          <Button
            type="button"
            variant={operationType === 'NAO_RECEBIMENTO' ? 'primary' : 'secondary'}
            onClick={() => { setOperationType('NAO_RECEBIMENTO'); setError(''); }}
          >
            Não Recebimento
          </Button>
        </div>

        {error && <div className="internal-alert" role="alert">{error}</div>}

        {operationType === 'RECEBIMENTO' && (
          createdRec ? (
            <Card className="recebimento-success-card">
              <span className="card-kicker">Operação registrada</span>
              <h3>Recebimento #{createdRec.id_recebimento}</h3>
              <p>O recebimento foi persistido com status {createdRec.status_recebimento}.</p>
              <div className="recebimento-actions">
                <Link className="ui-button ui-button-secondary" to={`/armazem/recebimentos/${createdRec.id_recebimento}`}>Ver detalhes</Link>
                <Button type="button" variant="ghost" onClick={resetRec}>Registrar outro</Button>
              </div>
            </Card>
          ) : (
            <Card>
              <form className="recebimento-form" onSubmit={submitRecebimento}>
                <div className="recebimento-form-grid">
                  <label>Agendamento
                    <Select value={formRec.id_agendamento} onChange={(event) => updateFormRec('id_agendamento', event.target.value)} required>
                      <option value="">Selecione...</option>
                      {agendamentos.map(ag => (
                        <option key={ag.id_agendamento} value={ag.id_agendamento}>
                          #{ag.id_agendamento} - {ag.fornecedor?.nome_fornecedor || 'Fornecedor desconhecido'} ({new Date(ag.data_agendada).toLocaleDateString()} {ag.horario_agendado})
                        </option>
                      ))}
                    </Select>
                  </label>
                  <label>Armazém
                    <Select value={formRec.id_armazem} onChange={(event) => updateFormRec('id_armazem', event.target.value)} required>
                      <option value="">Selecione...</option>
                      {armazens.map(arm => (
                        <option key={arm.id_armazem} value={arm.id_armazem}>
                          {arm.nome_armazem} ({arm.codigo_deposito})
                        </option>
                      ))}
                    </Select>
                  </label>
                  <label>Hora de chegada
                    <Input type="datetime-local" value={formRec.hora_chegada} onChange={(event) => updateFormRec('hora_chegada', event.target.value)} required />
                  </label>
                  <label>Hora de entrada
                    <Input type="datetime-local" value={formRec.hora_entrada} onChange={(event) => updateFormRec('hora_entrada', event.target.value)} required />
                  </label>
                  <label>Hora de saída
                    <Input type="datetime-local" value={formRec.hora_saida} onChange={(event) => updateFormRec('hora_saida', event.target.value)} required />
                  </label>
                  <label>Chapas utilizadas
                    <Input type="number" min="1" step="1" value={formRec.qtd_chapas_utilizados} onChange={(event) => updateFormRec('qtd_chapas_utilizados', event.target.value)} required />
                  </label>
                </div>
                <div className="recebimento-section-heading">
                  <div><h3>Equipamentos</h3><p>Informe os equipamentos e as quantidades utilizadas na descarga.</p></div>
                  <Button type="button" variant="ghost" onClick={addEquipment}>Adicionar equipamento</Button>
                </div>
                {equipamentos.length === 0 && <p className="recebimento-muted">Nenhum equipamento informado.</p>}
                <div className="recebimento-equipment-list">
                  {equipamentos.map((equipment) => <div className="recebimento-equipment-row" key={equipment.id}>
                    <label>Equipamento
                      <Select value={equipment.id_tipo_equipamento} onChange={(event) => updateEquipment(equipment.id, 'id_tipo_equipamento', event.target.value)}>
                        <option value="">Selecione...</option>
                        {equipamentosOptions.map(opt => (
                          <option key={opt.id_tipo_equipamento} value={opt.id_tipo_equipamento}>
                            {opt.nome} (Disp: {opt.quantidade_disponivel})
                          </option>
                        ))}
                      </Select>
                    </label>
                    <label>Quantidade utilizada
                      <Input type="number" min="1" step="1" value={equipment.quantidade_utilizada} onChange={(event) => updateEquipment(equipment.id, 'quantidade_utilizada', event.target.value)} />
                    </label>
                    <Button type="button" variant="danger" onClick={() => removeEquipment(equipment.id)}>Remover</Button>
                  </div>)}
                </div>
                <div className="recebimento-actions"><Button type="submit" loading={loading}>Registrar recebimento</Button></div>
              </form>
            </Card>
          )
        )}

        {operationType === 'NAO_RECEBIMENTO' && (
          createdNaoRec ? (
            <Card className="recebimento-success-card">
              <span className="card-kicker">Operação registrada</span>
              <h3>Não Recebimento #{createdNaoRec.id}</h3>
              <p>O não recebimento foi persistido com sucesso.</p>
              <div className="recebimento-actions">
                <Button type="button" variant="ghost" onClick={resetNaoRec}>Registrar outro</Button>
              </div>
            </Card>
          ) : (
            <Card>
              <form className="recebimento-form" onSubmit={submitNaoRecebimento}>
                <div className="recebimento-form-grid">
                  <label>Agendamento
                    <Select value={formNaoRec.id_agendamento} onChange={(event) => updateFormNaoRec('id_agendamento', event.target.value)} required>
                      <option value="">Selecione...</option>
                      {agendamentos.map(ag => (
                        <option key={ag.id_agendamento} value={ag.id_agendamento}>
                          #{ag.id_agendamento} - {ag.fornecedor?.nome_fornecedor || 'Fornecedor desconhecido'} ({new Date(ag.data_agendada).toLocaleDateString()} {ag.horario_agendado})
                        </option>
                      ))}
                    </Select>
                    <small>Selecione um agendamento aprovado que não foi recebido.</small>
                  </label>
                  <label>Motivo
                    <Select value={formNaoRec.motivo_padronizado} onChange={(event) => updateFormNaoRec('motivo_padronizado', event.target.value)} required>
                      <option value="">Selecione...</option>
                      {motivos.map(motivo => (
                        <option key={motivo} value={motivo}>{motivo}</option>
                      ))}
                    </Select>
                  </label>
                  <label style={{ gridColumn: '1 / -1' }}>Observação
                    <Input 
                      type="text" 
                      value={formNaoRec.observacao} 
                      onChange={(event) => updateFormNaoRec('observacao', event.target.value)} 
                      required={motivosObsObrigatoria.includes(formNaoRec.motivo_padronizado)}
                      placeholder={motivosObsObrigatoria.includes(formNaoRec.motivo_padronizado) ? "Observação obrigatória para este motivo" : "Opcional"}
                    />
                  </label>
                </div>
                <div className="recebimento-actions"><Button type="submit" loading={loading}>Registrar Não Recebimento</Button></div>
              </form>
            </Card>
          )
        )}
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
      <Breadcrumb items={[{ label: 'Armazém', path: '/armazem' }, { label: 'Recebimentos', path: '/armazem/recebimentos' }, { label: 'Detalhes' }]} />
      <PageContent>
        <div className="recebimento-heading"><div><h2>Detalhes do recebimento</h2><p>Consulta do recebimento #{id || 'selecionado'} no sistema.</p></div><Link className="ui-button ui-button-ghost" to="/armazem/recebimentos">Novo recebimento</Link></div>
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
