import { Link } from 'react-router-dom';
import '../styles.css';

export function NovoAgendamentoPage() {
  return (
    <section className="fornecedor-agendamentos-page">
      <Link className="fornecedor-back-link" to="/agendamentos">← Meus agendamentos</Link>
      <h2>Novo agendamento</h2>
      <p className="fornecedor-agendamentos-description">Preencha os dados iniciais. O envio para a plataforma será implementado em uma próxima etapa.</p>

      <form className="fornecedor-agendamento-form">
        <div className="fornecedor-form-group">
          <label htmlFor="nota-fiscal">Arquivo da nota fiscal</label>
          <input id="nota-fiscal" name="nota-fiscal" type="file" accept=".pdf,image/*" />
          <small>Nenhum arquivo é enviado ou armazenado nesta etapa.</small>
        </div>
        <div className="fornecedor-form-group">
          <label htmlFor="acondicionamento">Acondicionamento</label>
          <select id="acondicionamento" name="acondicionamento" defaultValue="">
            <option value="" disabled>Selecione uma opção</option>
          </select>
        </div>
        <div className="fornecedor-form-row">
          <div className="fornecedor-form-group">
            <label htmlFor="data">Data</label>
            <input id="data" name="data" type="date" />
          </div>
          <div className="fornecedor-form-group">
            <label htmlFor="horario">Horário</label>
            <input id="horario" name="horario" type="time" />
          </div>
        </div>
        <button className="fornecedor-button fornecedor-button-disabled" type="button" disabled>
          Envio disponível em breve
        </button>
      </form>
    </section>
  );
}
