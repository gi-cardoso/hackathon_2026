import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import { FornecedoresPage } from './pages/FornecedoresPage';
import { ModuleLayout } from './pages/ModulePage';
import { ModuleStatusPage } from './pages/ModuleStatusPage';
import type { ModuleMenuItem } from './components/ModuleHeader';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { RoleRoute } from './components/RoleRoute';
import { SessionExpiryNotice } from './components/SessionExpiryNotice';
import {
  AgendaOperacionalPage,
  AgendamentoDetailPage,
  AgendamentosListPage,
} from './features/agendamentos/pages';
import {
  RecebimentoDetailPage,
  RegistrarRecebimentoPage,
} from './features/recebimentos/pages/RecebimentosPage';
import { BoletinsPage } from './features/boletins/pages/BoletinsPage';
import './App.css';
import { NotFound } from './pages/NotFound';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/compras" replace />;
}

function AccessDeniedPage() {
  return <main className="page-content"><div className="module-status-page"><span className="page-eyebrow">Acesso restrito</span><h1>Você não tem permissão para esta área.</h1><p>Solicite o perfil adequado ao administrador do portal.</p></div></main>;
}

const modules = [
  {
    path: 'compras',
    title: 'Compras',
    description: 'Fila de análise e relacionamento com fornecedores.',
    roles: ['COMPRAS', 'ADMIN'],
    pages: [
      { slug: 'solicitacoes', label: 'Solicitações', title: 'Solicitações de compras' },
      { slug: 'fornecedores', label: 'Fornecedores', title: 'Fornecedores' },
    ],
  },
  {
    path: 'armazem',
    title: 'Armazém',
    description: 'Portaria, estoque e movimentação de cargas.',
    roles: ['ARMAZEM', 'PORTARIA', 'ADMIN'],
    pages: [
      { slug: 'estoque', label: 'Estoque', title: 'Estoque' },
      { slug: 'movimentacoes', label: 'Movimentações', title: 'Movimentações' },
    ],
  },
  {
    path: 'boletim',
    title: 'Boletim',
    description: 'Lançamento e fechamento da produção diária.',
    roles: ['BOLETIM', 'ADMIN'],
    pages: [
      { slug: 'publicacoes', label: 'Publicações', title: 'Publicações' },
      { slug: 'comunicados', label: 'Comunicados', title: 'Comunicados' },
    ],
  },
  {
    path: 'bi',
    title: 'BI',
    description: 'Indicadores para decisão operacional.',
    roles: ['BI', 'GESTOR', 'ADMIN'],
    pages: [
      { slug: 'indicadores', label: 'Indicadores', title: 'Indicadores' },
      { slug: 'relatorios', label: 'Relatórios', title: 'Relatórios' },
    ],
  },
  {
    path: 'usuarios',
    title: 'Usuários',
    description: 'Acessos, perfis e convites da operação.',
    roles: ['ADMIN'],
    pages: [
      { slug: 'lista', label: 'Lista de usuários', title: 'Lista de usuários' },
      { slug: 'convites', label: 'Convites', title: 'Convites' },
    ],
  },
  {
    path: 'configuracoes',
    title: 'Configurações',
    description: 'Preferências e integrações do portal.',
    roles: ['ADMIN'],
    pages: [
      { slug: 'preferencias', label: 'Preferências', title: 'Preferências' },
      { slug: 'integracoes', label: 'Integrações', title: 'Integrações' },
    ],
  },
] as const;

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <SessionExpiryNotice />
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
          <Route path="/acesso-negado" element={<PrivateRoute><AccessDeniedPage /></PrivateRoute>} />
          <Route
            path="/agendamentos"
            element={
              <PrivateRoute>
                <RoleRoute roles={['COMPRAS', 'ARMAZEM', 'PORTARIA', 'ADMIN']}>
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
                </RoleRoute>
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="lista" replace />} />
            <Route path="lista" element={<AgendamentosListPage />} />
            <Route path="agenda-operacional" element={<AgendaOperacionalPage />} />
            <Route path=":id" element={<AgendamentoDetailPage />} />
          </Route>
          <Route
            path="/recebimentos"
            element={
              <PrivateRoute>
                <RoleRoute roles={['ARMAZEM', 'ADMIN']}>
                <AppLayout>
                  <ModuleLayout
                    title="Recebimentos"
                    description="Registro das operações realizadas no armazém."
                    menuItems={[{ label: 'Registrar recebimento', path: '/recebimentos' }]}
                  />
                </AppLayout>
                </RoleRoute>
              </PrivateRoute>
            }
          >
            <Route index element={<RegistrarRecebimentoPage />} />
            <Route path=":id" element={<RecebimentoDetailPage />} />
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
                    <RoleRoute roles={module.roles}>
                    <AppLayout>
                      <ModuleLayout
                        title={module.title}
                        description={module.description}
                        menuItems={menuItems}
                      />
                    </AppLayout>
                    </RoleRoute>
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
                      : module.path === 'compras' && page.slug === 'fornecedores'
                        ? <FornecedoresPage />
                      : module.path === 'boletim' && page.slug === 'publicacoes'
                        ? <BoletinsPage />
                      : <ModuleStatusPage modulePath={module.path} moduleTitle={module.title} title={page.title} />}
                  />
                ))}
                {module.path === 'boletim' && <Route path="publicacoes/:id" element={<BoletinsPage />} />}
              </Route>
            );
          })}
          <Route path="/" element={<Navigate to="/compras" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
