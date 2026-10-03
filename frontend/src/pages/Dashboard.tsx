import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>COCAPEC - Área Interna</h2>
        <div className="user-info">
          <span>Olá, {user?.nome || 'Usuário'}</span>
          <button className="btn-logout" onClick={handleLogout}>Sair</button>
        </div>
      </header>
      <main className="dashboard-main">
        <p>Bem-vindo ao portal interno da COCAPEC.</p>
        <p>Seu perfil de acesso é: <strong>{user?.role}</strong></p>
      </main>
    </div>
  );
}
