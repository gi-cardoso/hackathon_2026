import { Link, useParams } from 'react-router-dom';
import { Breadcrumb } from '../../../components/Breadcrumb';
import { PageContent } from '../../../components/layout/PageContent';
import { AgendamentosPlaceholder } from '../components/AgendamentosPlaceholder';
import '../styles.css';

export function AgendamentoDetailPage() {
  const { id } = useParams();

  return (
    <>
      <Breadcrumb items={[{ label: 'Início', path: '/agendamentos' }, { label: 'Agendamentos', path: '/agendamentos/lista' }, { label: 'Detalhes' }]} />
      <PageContent>
        <h2>Detalhes do agendamento</h2>
        <p className="agendamentos-intro">Consulta preparada para o agendamento {id ? `#${id}` : 'selecionado'}.</p>
        <AgendamentosPlaceholder
          title="Detalhes indisponíveis nesta etapa"
          description="A página está pronta para receber o contrato de consulta futuro, sem simular informações de agendamento."
        />
        <Link className="agendamentos-back-link" to="/agendamentos/lista">Voltar para a lista</Link>
      </PageContent>
    </>
  );
}
