import { useAuth } from '../contexts/AuthContext';
import './DashboardFornecedor.css';

export default function DashboardFornecedor() {
  const { fornecedor } = useAuth();

  return (
    <div className="dashboard-card">
      <h2>Bem-vindo à Rede Integrada da COCAPEC</h2>
      <p>Este é o seu portal exclusivo para fornecedores.</p>
      <div className="fornecedor-details">
        <p><strong>CNPJ:</strong> {fornecedor?.cnpj}</p>
        <p><strong>Contato principal:</strong> {fornecedor?.contato || 'Não informado'}</p>
        <p>Use a navegação acima para consultar ou iniciar um agendamento.</p>
      </div>
    </div>
  );
}
