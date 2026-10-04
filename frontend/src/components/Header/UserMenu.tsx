import './UserMenu.css';

export function getInitials(nome: string): string {
  const parts = nome.trim().split(' ');
  if (parts.length === 0 || parts[0] === '') return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface UserMenuProps {
  nome: string;
  role: string;
}

export function UserMenu({ nome, role }: UserMenuProps) {
  return (
    <button className="user-menu-btn" type="button">
      <div className="user-avatar">
        {getInitials(nome)}
      </div>
      <div className="user-info">
        <span className="user-name">{nome}</span>
        <span className="user-role">{role}</span>
      </div>
    </button>
  );
}
