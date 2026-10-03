import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../Logo';
import './Header.css';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-title"><Logo variant="full" height="clamp(28px, 4vw, 40px)" /><span>Portal Interno</span></div>
      <div className="header-user">
        <span>Olá, {user?.nome || 'Usuário'}</span>
        <button onClick={handleLogout} className="btn-logout">Sair</button>
      </div>
    </header>
  );
}
