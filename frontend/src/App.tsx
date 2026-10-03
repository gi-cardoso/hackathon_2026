import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import { ModuleLayout } from './pages/ModulePage';
import { ModuleStatusPage } from './pages/ModuleStatusPage';
import type { ModuleMenuItem } from './components/ModuleHeader';
import { AppLayout } from './components/layout/AppLayout';
import {
  AgendaOperacionalPage,
  AgendamentoDetailPage,
  AgendamentosListPage,
} from './features/agendamentos/pages';
import './App.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/compras" replace />;
}

const modules = [
  {
    path: 'compras',
    title: 'Compras',
    description: 'Fila de análise e relacionamento com fornecedores.',
    pages: [
      { slug: 'solicitacoes', label: 'Solicitações', title: 'Solicitações de compras' },
      { slug: 'fornecedores', label: 'Fornecedores', title: 'Fornecedores' },
    ],
  },
  {
    path: 'armazem',
    title: 'Armazém',
    description: 'Portaria, estoque e movimentação de cargas.',
    pages: [
      { slug: 'estoque', label: 'Estoque', title: 'Estoque' },
      { slug: 'movimentacoes', label: 'Movimentações', title: 'Movimentações' },
    ],
  },
  {
    path: 'boletim',
    title: 'Boletim',
    description: 'Lançamento e fechamento da produção diária.',
    pages: [
      { slug: 'publicacoes', label: 'Publicações', title: 'Publicações' },
      { slug: 'comunicados', label: 'Comunicados', title: 'Comunicados' },
    ],
  },
  {
    path: 'bi',
    title: 'BI',
    description: 'Indicadores para decisão operacional.',
    pages: [
      { slug: 'indicadores', label: 'Indicadores', title: 'Indicadores' },
      { slug: 'relatorios', label: 'Relatórios', title: 'Relatórios' },
    ],
  },
  {
    path: 'usuarios',
    title: 'Usuários',
    description: 'Acessos, perfis e convites da operação.',
    pages: [
      { slug: 'lista', label: 'Lista de usuários', title: 'Lista de usuários' },
      { slug: 'convites', label: 'Convites', title: 'Convites' },
    ],
  },
  {
    path: 'configuracoes',
    title: 'Configurações',
    description: 'Preferências e integrações do portal.',
    pages: [
      { slug: 'preferencias', label: 'Preferências', title: 'Preferências' },
      { slug: 'integracoes', label: 'Integrações', title: 'Integrações' },
    ],
  },
] as const;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <Navigate to="/compras" replace />
            } 
          />
          <Route
            path="/agendamentos"
            element={
              <PrivateRoute>
                <AppLayout>
                  <ModuleLayout
                    title="Agendamentos"
                    description="Acompanhamento e organização dos agendamentos de entrega."
                    menuItems={[
                      { label: 'Lista de agendamentos', path: '/agendamentos/lista' },
                      { label: 'Agenda operacional', path: '/agendamentos/agenda-operacional' },
                    ]}
                  />
                </AppLayout>
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="lista" replace />} />
            <Route path="lista" element={<AgendamentosListPage />} />
            <Route path="agenda-operacional" element={<AgendaOperacionalPage />} />
            <Route path=":id" element={<AgendamentoDetailPage />} />
          </Route>
          {modules.map((module) => {
            const menuItems: ModuleMenuItem[] = module.pages.map((page) => ({
              label: page.label,
              path: `/${module.path}/${page.slug}`,
            }));

            return (
              <Route
                key={module.path}
                path={`/${module.path}`}
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <ModuleLayout
                        title={module.title}
                        description={module.description}
                        menuItems={menuItems}
                      />
                    </AppLayout>
                  </PrivateRoute>
                }
              >
                <Route index element={<Navigate to={module.pages[0].slug} replace />} />
                {module.pages.map((page) => (
                  <Route
                    key={page.slug}
                    path={page.slug}
                    element={module.path === 'compras' && page.slug === 'solicitacoes'
                      ? <AgendamentosListPage />
                      : <ModuleStatusPage modulePath={module.path} moduleTitle={module.title} title={page.title} />}
                  />
                ))}
              </Route>
            );
          })}
          <Route path="/" element={<Navigate to="/compras" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
