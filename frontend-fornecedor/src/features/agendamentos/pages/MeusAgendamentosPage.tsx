import { Link } from 'react-router-dom';
import { AgendamentosEmptyState } from '../components/AgendamentosEmptyState';
import '../styles.css';

export function MeusAgendamentosPage() {
  return (
    <section className="fornecedor-agendamentos-page">
      <div className="fornecedor-agendamentos-heading">
        <div>
          <h2>Meus agendamentos</h2>
          <p>Acompanhe suas solicitações de entrega quando a integração estiver disponível.</p>
        </div>
        <Link className="fornecedor-button" to="/agendamentos/novo">Novo agendamento</Link>
      </div>
      <AgendamentosEmptyState
        title="Nenhum agendamento carregado"
        description="Esta página ainda não consulta dados persistentes nem apresenta agendamentos simulados."
      />
    </section>
  );
}
