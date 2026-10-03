import { Breadcrumb } from '../../../components/Breadcrumb';
import { PageContent } from '../../../components/layout/PageContent';
import { AgendamentosPlaceholder } from '../components/AgendamentosPlaceholder';
import '../styles.css';

export function AgendaOperacionalPage() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Início', path: '/agendamentos' }, { label: 'Agendamentos' }, { label: 'Agenda operacional' }]} />
      <PageContent>
        <h2>Agenda operacional</h2>
        <p className="agendamentos-intro">Espaço preparado para a visão operacional compartilhada entre Compras e Armazém.</p>
        <AgendamentosPlaceholder
          title="Agenda ainda não disponível"
          description="A visualização será conectada aos agendamentos em uma etapa futura, sem regras operacionais nesta fase."
        />
      </PageContent>
    </>
  );
}
