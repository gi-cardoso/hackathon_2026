import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Stepper } from '../../../components/ui/Stepper';
import { createAgendamento, getApiError, getAvailability, uploadInvoice } from '../../../services/api';
import type { AvailabilitySlot, InvoiceData } from '../../../services/api';
import '../../../components/ui/ui.css';
import '../styles.css';

type FormStep = 1 | 2 | 3 | 4 | 5;
type Acondicionamento = 'BATIDO' | 'PALETIZADO' | 'BIG_BAG';

const acondicionamentos: Array<{ value: Acondicionamento; title: string; description: string }> = [
  { value: 'BATIDO', title: 'Batido / Solto', description: 'Carga exclusiva no horário.' },
  { value: 'PALETIZADO', title: 'Paletizado / Sacaria', description: 'Até dois caminhões no horário.' },
  { value: 'BIG_BAG', title: 'Big Bag', description: 'Até dois caminhões no horário.' },
];

function getToday() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export function NovoAgendamentoPage() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<FormStep>(1);
  const [file, setFile] = useState<File | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [acondicionamento, setAcondicionamento] = useState<Acondicionamento | ''>('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!data || !acondicionamento) {
      return;
    }
    let active = true;
    setLoadingSlots(true);
    setError('');
    getAvailability(data, acondicionamento)
      .then((response) => { if (active) setSlots(response.horarios); })
      .catch((requestError: unknown) => { if (active) setError(getApiError(requestError)); })
      .finally(() => { if (active) setLoadingSlots(false); });
    return () => { active = false; };
  }, [data, acondicionamento]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setInvoice(null);
    setError('');
    if (!selectedFile) return;
    setLoading(true);
    try {
      setInvoice(await uploadInvoice(selectedFile));
      setStep(2);
    } catch (requestError: unknown) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!invoice || !acondicionamento || !data || !horario) return;
    setLoading(true);
    setError('');
    try {
      await createAgendamento({
        id_nota: invoice.id_nota,
        data_agendada: data,
        horario_agendado: horario,
        tipo_acondicionamento: acondicionamento,
        peso_total: invoice.transporte?.volumes?.pesoBruto ?? 0,
      });
      await queryClient.invalidateQueries({ queryKey: ['agendamentos', 'fornecedor'] });
      setStep(5);
    } catch (requestError: unknown) {
      setError(getApiError(requestError));
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  if (step === 5) {
    return <section className="fornecedor-agendamentos-page fornecedor-confirmation"><span className="fornecedor-eyebrow">Agendamento criado</span><h2>Seu caminhão está na fila certa.</h2><p>O pedido foi enviado para análise da COCAPEC. Você poderá acompanhar a evolução pelo portal.</p><div className="fornecedor-confirmation-actions"><Link className="fornecedor-button" to="/agendamentos">Ver meus agendamentos</Link><Link className="fornecedor-button fornecedor-button-secondary" to="/dashboard">Voltar ao início</Link></div></section>;
  }

  return (
    <section className="fornecedor-agendamentos-page" aria-labelledby="new-appointment-title">
      <Link className="fornecedor-back-link" to="/dashboard">Voltar ao início</Link>
      <span className="fornecedor-eyebrow">Operação de recebimento</span>
      <h2 id="new-appointment-title">Novo agendamento</h2>
      <p className="fornecedor-agendamentos-description">Organize a entrega em quatro passos. A disponibilidade é consultada em tempo real.</p>
      <Stepper current={Math.min(step, 4)} steps={['Nota fiscal', 'Carga', 'Horário', 'Revisão']} />
      {error && <div className="fornecedor-alert" role="alert">{error}</div>}

      {step === 1 && <Card className="fornecedor-wizard-card"><h3>1. Envie a nota fiscal</h3><p>PDF ou XML de até 15 MB. Nós extraímos os dados para você conferir.</p><input ref={fileInputRef} type="file" accept=".pdf,.xml,application/pdf,application/xml,text/xml,application/x-xml" onChange={handleFileChange} disabled={loading} />{file && <p className="fornecedor-file-name">{file.name}</p>}<Button type="button" loading={loading} onClick={() => fileInputRef.current?.click()}>{file ? 'Trocar arquivo' : 'Selecionar arquivo'}</Button></Card>}

      {step === 2 && <Card className="fornecedor-wizard-card"><h3>2. Como a carga chega?</h3><div className="fornecedor-choice-grid">{acondicionamentos.map((option) => <button key={option.value} className={`fornecedor-choice ${acondicionamento === option.value ? 'is-selected' : ''}`} type="button" onClick={() => { setAcondicionamento(option.value); setSlots([]); setStep(3); }}><strong>{option.title}</strong><span>{option.description}</span></button>)}</div><Button type="button" variant="ghost" onClick={() => setStep(1)}>Voltar</Button></Card>}

      {step === 3 && <Card className="fornecedor-wizard-card"><h3>3. Escolha data e horário</h3><div className="fornecedor-form-group"><label htmlFor="data">Data da entrega</label><input id="data" type="date" min={getToday()} value={data} onChange={(event) => { setData(event.target.value); setHorario(''); setSlots([]); }} /></div><div className="fornecedor-slot-grid" aria-live="polite">{loadingSlots ? <p>Consultando disponibilidade...</p> : slots.map((slot) => <button key={slot.horario} type="button" disabled={!slot.disponivel} className={`fornecedor-slot ${slot.disponivel ? 'is-available' : 'is-occupied'} ${horario === slot.horario ? 'is-selected' : ''}`} onClick={() => setHorario(slot.horario)}><strong>{slot.horario}</strong><span>{slot.disponivel ? `${slot.vagas_restantes} vaga(s)` : 'Ocupado'}</span></button>)}</div><div className="fornecedor-wizard-actions"><Button type="button" variant="ghost" onClick={() => setStep(2)}>Voltar</Button><Button type="button" disabled={!data || !horario} onClick={() => setStep(4)}>Continuar</Button></div></Card>}

      {step === 4 && <Card className="fornecedor-wizard-card"><h3>4. Revise antes de confirmar</h3><dl className="fornecedor-agendamento-summary"><div><dt>Nota fiscal</dt><dd>{file?.name}</dd></div><div><dt>Operação</dt><dd>{invoice?.identificacao?.naturezaOperacao || 'Recebimento'}</dd></div><div><dt>Acondicionamento</dt><dd>{acondicionamentos.find((item) => item.value === acondicionamento)?.title}</dd></div><div><dt>Data e horário</dt><dd>{data} às {horario}</dd></div></dl><div className="fornecedor-wizard-actions"><Button type="button" variant="ghost" onClick={() => setStep(3)}>Editar</Button><Button type="button" loading={loading} onClick={() => void handleSubmit()}>Confirmar agendamento</Button></div></Card>}
    </section>
  );
}
