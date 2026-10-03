import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './Logo';
import './PortalFornecedorLayout.css';

export function PortalFornecedorLayout() {
  const { fornecedor, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="fornecedor-layout">
      <header className="fornecedor-layout-header">
        <div className="fornecedor-brand-block">
          <div className="fornecedor-logo"><Logo variant="full-dark" height="clamp(34px, 5vw, 52px)" /></div>
          <div>
            <h1>Portal do fornecedor</h1>
            <p>O melhor café está aqui</p>
          </div>
          <nav aria-label="Navegação do fornecedor">
            <NavLink to="/dashboard">Início</NavLink>
            <NavLink to="/agendamentos" end>Meus agendamentos</NavLink>
            <NavLink to="/agendamentos/novo">Novo agendamento</NavLink>
          </nav>
        </div>
        <div className="fornecedor-layout-user">
          <span>Olá, {fornecedor?.nome_fornecedor || 'Fornecedor'}</span>
          <button className="btn-logout" onClick={handleLogout}>Sair</button>
        </div>
      </header>
      <main className="fornecedor-layout-main">
        <Outlet />
      </main>
    </div>
  );
}
