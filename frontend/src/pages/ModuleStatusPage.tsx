import { Breadcrumb } from '../components/Breadcrumb';
import { Card } from '../components/ui/Card';
import { PageContent } from '../components/layout/PageContent';
import './ModuleStatusPage.css';

interface ModuleStatusPageProps {
  modulePath: string;
  moduleTitle: string;
  title: string;
  description?: string;
}

export function ModuleStatusPage({ modulePath, moduleTitle, title, description }: ModuleStatusPageProps) {
  return <><Breadcrumb items={[{ label: 'Início', path: `/${modulePath}` }, { label: moduleTitle }, { label: title }]} /><PageContent><div className="module-status-page"><h2>{title}</h2><p>{description || `Área de ${moduleTitle.toLowerCase()} preparada para a próxima integração.`}</p><Card><strong>Dados de integração pendentes</strong><span>Esta tela está pronta para receber a API deste domínio. Não há dados falsos sendo apresentados.</span><code>// TODO: conectar API quando o endpoint estiver disponível</code></Card></div></PageContent></>;
}
