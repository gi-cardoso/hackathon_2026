import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './DashboardFornecedor.css';

export default function DashboardFornecedor() {
  const { fornecedor, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Portal do Fornecedor</h2>
        <div className="user-info">
          <span>Olá, {fornecedor?.nome_fornecedor || 'Fornecedor'}</span>
          <button className="btn-logout" onClick={handleLogout}>Sair</button>
        </div>
      </header>
      <main className="dashboard-main">
        <div className="dashboard-card">
          <h3>Bem-vindo à Rede Integrada da COCAPEC</h3>
          <p>Este é o seu portal exclusivo para fornecedores.</p>
          <div className="fornecedor-details">
            <p><strong>CNPJ:</strong> {fornecedor?.cnpj}</p>
            <p><strong>Contato principal:</strong> {fornecedor?.contato || 'Não informado'}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
