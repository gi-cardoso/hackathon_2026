import { Outlet } from 'react-router-dom';
import { ModuleHeader } from '../components/ModuleHeader';
import type { ModuleMenuItem } from '../components/ModuleHeader';

interface ModuleLayoutProps {
  title: string;
  description: string;
  menuItems: ModuleMenuItem[];
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
