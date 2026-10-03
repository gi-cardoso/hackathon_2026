import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { ModuleHeader } from '../components/layout/ModuleHeader';
import { PageContent } from '../components/layout/PageContent';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <ModuleHeader title="Dashboard Principal">
        <button className="btn-primary" style={{ padding: '8px 15px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Ação do Módulo</button>
      </ModuleHeader>
      
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
