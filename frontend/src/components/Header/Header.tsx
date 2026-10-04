import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../Logo';
import { UserMenu } from './UserMenu';
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
      <div className="header-title"><Logo variant="symbol" height="32px" /></div>
      <div className="header-user">
        <UserMenu nome={user?.nome || 'Usuário'} role={user?.role || 'Visitante'} onLogout={handleLogout} />
      </div>
    </header>
  );
}
