import { NavLink } from 'react-router-dom';
import { Logo } from '../Logo';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

export function Sidebar() {
  const { user } = useAuth();
  const items = [
    { path: '/compras', label: 'Compras', roles: ['COMPRAS', 'ADMIN'] },
    { path: '/agendamentos', label: 'Agendamentos', roles: ['COMPRAS', 'ARMAZEM', 'PORTARIA', 'ADMIN'] },
    { path: '/recebimentos', label: 'Recebimentos', roles: ['ARMAZEM', 'ADMIN'] },
    { path: '/armazem', label: 'Armazém', roles: ['ARMAZEM', 'PORTARIA', 'ADMIN'] },
    { path: '/boletim', label: 'Boletim', roles: ['BOLETIM', 'ADMIN'] },
    { path: '/bi', label: 'BI', roles: ['BI', 'GESTOR', 'ADMIN'] },
    { path: '/usuarios', label: 'Usuários', roles: ['ADMIN'] },
    { path: '/configuracoes', label: 'Configurações', roles: ['ADMIN'] },
  ];

  return (
    <aside className="sidebar-container" aria-label="Navegação principal">
      <div className="sidebar-logo"><Logo variant="full-dark" height="clamp(34px, 5vw, 54px)" /></div>
      
      <nav className="sidebar-nav" aria-label="Módulos">
        <ul>
          {items.filter((item) => user && item.roles.includes(user.role)).map((item) => <li key={item.path}><NavLink to={item.path} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>{item.label}</NavLink></li>)}
        </ul>
      </nav>

    </aside>
  );
}
