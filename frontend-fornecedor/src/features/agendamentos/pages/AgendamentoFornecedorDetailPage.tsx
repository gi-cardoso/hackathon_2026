import { Link, useParams } from 'react-router-dom';
import { AgendamentosEmptyState } from '../components/AgendamentosEmptyState';
import '../styles.css';

export function AgendamentoFornecedorDetailPage() {
  const { id } = useParams();

  return (
    <section className="fornecedor-agendamentos-page">
      <Link className="fornecedor-back-link" to="/agendamentos">← Meus agendamentos</Link>
      <h2>Detalhes do agendamento</h2>
      <p className="fornecedor-agendamentos-description">Consulta preparada para o agendamento {id ? `#${id}` : 'selecionado'}.</p>
      <AgendamentosEmptyState
        title="Detalhes indisponíveis nesta etapa"
        description="Nenhum dado de agendamento foi criado ou consultado enquanto o contrato de API não estiver disponível."
      />
    </section>
  );
}
