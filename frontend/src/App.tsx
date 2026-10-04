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
import { IndicadoresPage } from './features/bi/pages';
import { UsersPage } from './features/usuarios/pages';
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
    roles: ['ARMAZEM', 'ADMIN'],
    pages: [
      { slug: 'recebimentos', label: 'Recebimentos', title: 'Recebimentos' },
    ],
  },
  {
    path: 'boletim',
    title: 'Boletim',
    description: 'Lançamento e fechamento da produção diária.',
    roles: ['BOLETIM', 'ADMIN'],
    pages: [
      { slug: 'publicacoes', label: 'Publicações', title: 'Publicações' },
    ],
  },
  {
    path: 'bi',
    title: 'DashBoard',
    description: 'Indicadores para decisão operacional.',
    roles: ['GESTOR', 'ADMIN'],
    pages: [
      { slug: 'indicadores', label: 'Indicadores', title: 'Indicadores' },
    ],
  },
  {
    path: 'usuarios',
    title: 'Usuários',
    description: 'Acessos, perfis e convites da operação.',
    roles: ['ADMIN'],
    pages: [
      { slug: 'lista', label: 'Lista de usuários', title: 'Lista de usuários' },
    ],
  },
  {
    path: 'configuracoes',
    title: 'Configurações',
    description: 'Preferências e integrações do portal.',
    roles: ['ADMIN'],
    pages: [
      { slug: 'preferencias', label: 'Preferências', title: 'Preferências' },
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
                <RoleRoute roles={['COMPRAS', 'ARMAZEM', 'ADMIN']}>
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
                      : module.path === 'armazem' && page.slug === 'recebimentos'
                        ? <RegistrarRecebimentoPage />
                      : module.path === 'bi' && page.slug === 'indicadores'
                        ? <IndicadoresPage />
                      : module.path === 'usuarios' && page.slug === 'lista'
                        ? <UsersPage />
                      : <ModuleStatusPage modulePath={module.path} moduleTitle={module.title} title={page.title} />}
                  />
                ))}
                {module.path === 'boletim' && <Route path="publicacoes/:id" element={<BoletinsPage />} />}
                {module.path === 'armazem' && <Route path="recebimentos/:id" element={<RecebimentoDetailPage />} />}
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
