import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RoleRouteProps {
  roles: readonly string[];
  children: ReactNode;
}

export function RoleRoute({ roles, children }: RoleRouteProps) {
  const { user } = useAuth();
  return user && roles.includes(user.role) ? <>{children}</> : <Navigate to="/acesso-negado" replace />;
}