import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { TimeSlotGrid } from '../components/TimeSlotGrid';
import { getTemporaryTimeSlots } from '../data/temporaryTimeSlots';
import '../styles.css';

type FormStep = 'form' | 'review' | 'confirmed';
type FormErrors = Partial<Record<'notaFiscal' | 'acondicionamento' | 'data' | 'horario', string>>;

const acondicionamentos = ['Batido/Solto', 'Paletizado/Sacaria', 'Big Bag'];

function getToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(`${date}T00:00:00`));
}

export function NovoAgendamentoPage() {
  const [step, setStep] = useState<FormStep>('form');
  const [notaFiscal, setNotaFiscal] = useState<File | null>(null);
  const [acondicionamento, setAcondicionamento] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timeSlots = getTemporaryTimeSlots(data, acondicionamento);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!notaFiscal) nextErrors.notaFiscal = 'Selecione o arquivo da nota fiscal.';
    if (!acondicionamento) nextErrors.acondicionamento = 'Selecione o tipo de acondicionamento.';
    if (!data) {
      nextErrors.data = 'Selecione a data do agendamento.';
    } else if (data < getToday()) {
      nextErrors.data = 'Selecione uma data a partir de hoje.';
    }
    if (!horario) nextErrors.horario = 'Selecione um horário.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setNotaFiscal(file);
    setErrors((current) => ({ ...current, notaFiscal: undefined }));
  };

  const handleContinue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validate()) setStep('review');
  };

  const resetForm = () => {
    setStep('form');
    setNotaFiscal(null);
    setAcondicionamento('');
    setData('');
    setHorario('');
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (step === 'confirmed') {
    return (
      <section className="fornecedor-agendamentos-page fornecedor-confirmation" aria-labelledby="confirmation-title">
        <p className="fornecedor-step-label">Confirmação visual</p>
        <h2 id="confirmation-title">Revisão concluída</h2>
        <p>O fluxo foi confirmado apenas nesta tela. Nenhum agendamento foi enviado, salvo ou persistido.</p>
        <div className="fornecedor-confirmation-actions">
          <button className="fornecedor-button" type="button" onClick={resetForm}>Criar outro agendamento</button>
          <Link className="fornecedor-button fornecedor-button-secondary" to="/agendamentos">Voltar para meus agendamentos</Link>
        </div>
      </section>
    );
  }

  if (step === 'review') {
    return (
      <section className="fornecedor-agendamentos-page" aria-labelledby="review-title">
        <p className="fornecedor-step-label">Etapa 2 de 2 · Revisão</p>
        <h2 id="review-title">Revise seu agendamento</h2>
        <p className="fornecedor-agendamentos-description">Confira as informações antes da confirmação visual.</p>
        <dl className="fornecedor-agendamento-summary">
          <div><dt>Arquivo da nota fiscal</dt><dd>{notaFiscal?.name} <span>({notaFiscal && formatFileSize(notaFiscal.size)})</span></dd></div>
          <div><dt>Acondicionamento</dt><dd>{acondicionamento}</dd></div>
          <div><dt>Data</dt><dd>{formatDate(data)}</dd></div>
          <div><dt>Horário</dt><dd>{horario}</dd></div>
        </dl>
        <p className="fornecedor-local-notice">A confirmação abaixo apenas demonstra o fluxo no frontend; nenhum dado será persistido.</p>
        <div className="fornecedor-confirmation-actions">
          <button className="fornecedor-button fornecedor-button-secondary" type="button" onClick={() => setStep('form')}>Editar informações</button>
          <button className="fornecedor-button" type="button" onClick={() => setStep('confirmed')}>Confirmar visualmente</button>
        </div>
      </section>
    );
  }

  return (
    <section className="fornecedor-agendamentos-page" aria-labelledby="new-appointment-title">
      <Link className="fornecedor-back-link" to="/agendamentos">← Meus agendamentos</Link>
      <p className="fornecedor-step-label">Etapa 1 de 2 · Dados do agendamento</p>
      <h2 id="new-appointment-title">Novo agendamento</h2>
      <p className="fornecedor-agendamentos-description">Informe os dados para revisar o agendamento. Nenhum arquivo ou informação será enviado nesta etapa.</p>

      <form className="fornecedor-agendamento-form" onSubmit={handleContinue} noValidate>
        <div className="fornecedor-form-group">
          <label htmlFor="nota-fiscal">Arquivo da Nota Fiscal Eletrônica</label>
          <input
            id="nota-fiscal"
            name="nota-fiscal"
            type="file"
            ref={fileInputRef}
            accept=".pdf,.xml,.jpg,.jpeg,.png,application/pdf,application/xml,text/xml,image/*"
            onChange={handleFileChange}
            aria-invalid={Boolean(errors.notaFiscal)}
            aria-describedby={errors.notaFiscal ? 'nota-fiscal-error' : 'nota-fiscal-help'}
          />
          <small id="nota-fiscal-help">O arquivo permanece somente neste navegador e não será enviado ao servidor.</small>
          {notaFiscal && (
            <div className="fornecedor-file-selected">
              <div><strong>{notaFiscal.name}</strong><span>{formatFileSize(notaFiscal.size)}</span></div>
              <button type="button" onClick={() => { setNotaFiscal(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>Remover arquivo</button>
            </div>
          )}
          {errors.notaFiscal && <span className="fornecedor-field-error" id="nota-fiscal-error">{errors.notaFiscal}</span>}
        </div>

        <div className="fornecedor-form-group">
          <label htmlFor="acondicionamento">Tipo de acondicionamento</label>
          <select
            id="acondicionamento"
            name="acondicionamento"
            value={acondicionamento}
            onChange={(event) => {
              setAcondicionamento(event.target.value);
              setHorario('');
              setErrors((current) => ({ ...current, acondicionamento: undefined, horario: undefined }));
            }}
            aria-invalid={Boolean(errors.acondicionamento)}
            aria-describedby={errors.acondicionamento ? 'acondicionamento-error' : undefined}
          >
            <option value="" disabled>Selecione uma opção</option>
            {acondicionamentos.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          {errors.acondicionamento && <span className="fornecedor-field-error" id="acondicionamento-error">{errors.acondicionamento}</span>}
        </div>

        <div className="fornecedor-form-row">
          <div className="fornecedor-form-group">
            <label htmlFor="data">Data do agendamento</label>
            <input
              id="data"
              name="data"
              type="date"
              min={getToday()}
              value={data}
              onChange={(event) => {
                setData(event.target.value);
                setHorario('');
                setErrors((current) => ({ ...current, data: undefined, horario: undefined }));
              }}
              aria-invalid={Boolean(errors.data)}
              aria-describedby={errors.data ? 'data-error' : undefined}
            />
            {errors.data && <span className="fornecedor-field-error" id="data-error">{errors.data}</span>}
          </div>
        </div>
        <TimeSlotGrid
          slots={timeSlots}
          selectedTime={horario}
          onSelect={(time) => {
            setHorario(time);
            setErrors((current) => ({ ...current, horario: undefined }));
          }}
        />
        <input type="hidden" name="horario" value={horario} />
        {errors.horario && <span className="fornecedor-field-error" id="horario-error">{errors.horario}</span>}
        <button className="fornecedor-button" type="submit">Continuar para revisão</button>
      </form>
    </section>
  );
}
