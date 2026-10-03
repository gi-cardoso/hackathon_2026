import { Outlet } from 'react-router-dom';
import { ModuleHeader } from '../components/ModuleHeader';
import { PageContent } from '../components/layout/PageContent';
import type { ModuleMenuItem } from '../components/ModuleHeader';

interface ModuleLayoutProps {
  title: string;
  description: string;
  menuItems: ModuleMenuItem[];
}

interface TemporaryPageProps {
  title: string;
}

export function ModuleLayout({ title, description, menuItems }: ModuleLayoutProps) {
  return (
    <>
      <ModuleHeader
        title={title}
        description={description}
        menuItems={menuItems}
      />
      <Outlet />
    </>
  );
}

export function TemporaryPage({ title }: TemporaryPageProps) {
  return (
    <PageContent>
      <h2>{title}</h2>
      <p>Esta página temporária representa a funcionalidade selecionada.</p>
    </PageContent>
  );
}
