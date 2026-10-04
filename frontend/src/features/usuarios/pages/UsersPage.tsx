import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Breadcrumb } from '../../../components/Breadcrumb';
import { PageContent } from '../../../components/layout/PageContent';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { getApiError, getUsers, createUser, deleteUser } from '../../../services/api';
import type { UserResponse, CreateUserPayload } from '../../../services/api';
import './styles.css';

const ROLES = [
  'ADMIN',
  'COMPRAS',
  'ARMAZEM',
  'PORTARIA',
  'BOLETIM',
  'BI',
  'GESTOR'
];

export function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateUserPayload>({
    nome: '',
    email: '',
    matricula: '',
    senha: '',
    role: '',
    ativo: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err: unknown) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.matricula || !formData.senha || !formData.role) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    setSubmitting(true);
    try {
      await createUser(formData);
      toast.success('Usuário criado com sucesso!');
      setShowForm(false);
      setFormData({ nome: '', email: '', matricula: '', senha: '', role: '', ativo: true });
      fetchUsers();
    } catch (err: unknown) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja remover este usuário?')) {
      return;
    }
    try {
      await deleteUser(id);
      toast.success('Usuário removido com sucesso.');
      setUsers((current) => current.filter((u) => u.id_usuario !== id));
    } catch (err: unknown) {
      toast.error(getApiError(err));
    }
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Início', path: '/usuarios' },
          { label: 'Usuários' },
          { label: 'Lista' },
        ]}
      />
      <PageContent>
        <div className="users-heading">
          <div>
            <span className="page-eyebrow">Gerenciamento</span>
            <h2>Lista de usuários</h2>
            <p>Gerencie os usuários do sistema e seus perfis de acesso.</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Adicionar usuário'}
          </Button>
        </div>

        {showForm && (
          <Card className="user-form-card">
            <h3>Novo usuário</h3>
            <form onSubmit={handleSubmit} className="user-form">
              <div className="user-form-grid">
                <label>
                  Nome completo
                  <Input 
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </label>
                <label>
                  E-mail
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Matrícula
                  <Input 
                    value={formData.matricula}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Senha
                  <Input 
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Perfil de Acesso (Role)
                  <select 
                    className="ui-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  >
                    <option value="">Selecione</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  />
                  <span>Usuário Ativo</span>
                </label>
              </div>
              <div className="user-form-actions">
                <Button type="submit" loading={submitting}>Salvar usuário</Button>
              </div>
            </form>
          </Card>
        )}

        {error && <div className="internal-alert" role="alert">{error}</div>}

        {!loading && !error && (
          <Card className="table-card">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Matrícula</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">Nenhum usuário cadastrado.</td>
                  </tr>
                )}
                {users.map((user) => (
                  <tr key={user.id_usuario}>
                    <td>{user.id_usuario}</td>
                    <td>{user.nome}</td>
                    <td>{user.email}</td>
                    <td>{user.matricula}</td>
                    <td><span className="user-role-badge">{user.role}</span></td>
                    <td>
                      <span className={`ui-status ${user.ativo ? 'ui-status-aprovado' : 'ui-status-rejeitado'}`}>
                        {user.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <Button variant="danger" onClick={() => handleDelete(user.id_usuario)}>Remover</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </PageContent>
    </>
  );
}
