import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PortalFornecedorLayout } from './components/PortalFornecedorLayout';
import {
  AgendamentoFornecedorDetailPage,
  MeusAgendamentosPage,
  NovoAgendamentoPage,
} from './features/agendamentos/pages';
import DashboardFornecedor from './pages/DashboardFornecedor';
import LoginFornecedor from './pages/LoginFornecedor';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginFornecedor /></PublicRoute>} />
          <Route element={<PrivateRoute><PortalFornecedorLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<DashboardFornecedor />} />
            <Route path="/agendamentos">
              <Route index element={<MeusAgendamentosPage />} />
              <Route path="novo" element={<NovoAgendamentoPage />} />
              <Route path=":id" element={<AgendamentoFornecedorDetailPage />} />
            </Route>
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
