import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { ModuleHeader } from '../components/ModuleHeader';
import { PageContent } from '../components/layout/PageContent';

export default function Dashboard() {
  const { user } = useAuth();

  const menuItems = [
    { label: 'Visão Geral', path: '/dashboard' },
    { label: 'Relatórios', path: '/dashboard/relatorios' }
  ];

  return (
    <AppLayout>
      <ModuleHeader 
        title="Dashboard Principal" 
        description="Painel de controle geral do sistema."
        menuItems={menuItems}
      />
      
      <PageContent>
        <p>Bem-vindo ao portal interno da COCAPEC.</p>
        <p>Seu perfil de acesso é: <strong>{user?.role}</strong></p>
        <div style={{ marginTop: '20px', padding: '20px', background: '#f9f9f9', border: '1px dashed #ccc', borderRadius: '4px' }}>
          <h3>Conteúdo Temporário</h3>
          <p>Esta área representa o conteúdo da página.</p>
        </div>
      </PageContent>
    </AppLayout>
  );
}
