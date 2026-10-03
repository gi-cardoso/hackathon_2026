import { Breadcrumb } from '../../../components/Breadcrumb';
import { PageContent } from '../../../components/layout/PageContent';
import { AgendamentosPlaceholder } from '../components/AgendamentosPlaceholder';
import '../styles.css';

export function AgendamentosListPage() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Início', path: '/agendamentos' }, { label: 'Agendamentos' }, { label: 'Lista de agendamentos' }]} />
      <PageContent>
        <h2>Lista de agendamentos</h2>
        <p className="agendamentos-intro">Consulte os agendamentos quando a integração com a plataforma estiver disponível.</p>
        <AgendamentosPlaceholder
          title="Nenhum agendamento carregado"
          description="Esta é uma estrutura inicial. Nenhum dado temporário ou persistente está sendo exibido."
        />
      </PageContent>
    </>
  );
}
