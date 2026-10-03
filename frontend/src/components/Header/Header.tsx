import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
      <div className="header-title">Portal Interno</div>
      <div className="header-user">
        <span>Olá, {user?.nome || 'Usuário'}</span>
        <button onClick={handleLogout} className="btn-logout">Sair</button>
      </div>
    </header>
  );
}
