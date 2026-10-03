import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export function Sidebar() {
  return (
    <aside className="sidebar-container">
      <div className="sidebar-logo">
        COCAPEC
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Início
            </NavLink>
          </li>
          <li>
            <NavLink to="/compras" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Compras
            </NavLink>
          </li>
          <li>
            <NavLink to="/armazem" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Armazém
            </NavLink>
          </li>
          <li>
            <NavLink to="/boletim" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Boletim
            </NavLink>
          </li>
          <li>
            <NavLink to="/bi" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              BI
            </NavLink>
          </li>
          <li>
            <NavLink to="/usuarios" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Usuários
            </NavLink>
          </li>
          <li>
            <NavLink to="/configuracoes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Configurações
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/login" className="sidebar-link" onClick={() => {
          // A lógica de logout pode ser acionada externamente ou mantida simples para o layout
        }}>
          Sair
        </NavLink>
      </div>
    </aside>
  );
}
