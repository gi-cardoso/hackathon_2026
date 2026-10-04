import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { LogOut, ChevronDown } from 'lucide-react';
import './UserMenu.css';

function getInitials(nome: string): string {
  const parts = nome.trim().split(' ');
  if (parts.length === 0 || parts[0] === '') return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface UserMenuProps {
  nome: string;
  role: string;
  onLogout: () => void;
}

export function UserMenu({ nome, role, onLogout }: UserMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="user-menu-btn" type="button" aria-label="Menu do usuário">
          <div className="user-avatar">
            {getInitials(nome)}
          </div>
          <div className="user-info">
            <span className="user-name">{nome}</span>
            <span className="user-role">{role}</span>
          </div>
          <ChevronDown className="user-menu-arrow" size={16} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="user-menu-content" sideOffset={8} align="end" collisionPadding={16}>
          <div className="user-menu-header">
            <span className="user-name">{nome}</span>
            <span className="user-role">{role}</span>
          </div>
          <DropdownMenu.Separator className="user-menu-separator" />
          <DropdownMenu.Item className="user-menu-item logout" onClick={onLogout}>
            <LogOut size={16} />
            <span>Sair</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
