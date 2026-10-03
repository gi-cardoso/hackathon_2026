import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="header-container">
      <div className="header-left">
        <button 
          className="header-btn-toggle" 
          onClick={onToggleSidebar}
          aria-label="Alternar Menu Lateral"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="header-right">
        {/* Notificações (Placeholder) */}
        <button className="header-btn-icon" aria-label="Notificações">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="notification-badge"></span>
        </button>

        {/* User Menu */}
        <div className="header-user-menu">
          <button 
            className="user-menu-btn" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            <div className="user-avatar">
              {getInitials(user?.nome || 'Usuário')}
            </div>
            <span className="user-name-short">{user?.nome?.split(' ')[0] || 'Usuário'}</span>
          </button>

          {isMenuOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <strong>{user?.nome || 'Usuário Autenticado'}</strong>
                <span>{user?.role || 'Perfil Indefinido'}</span>
              </div>
              <ul className="user-dropdown-list">
                <li>
                  <button onClick={handleLogout} className="user-dropdown-item text-danger">
                    Sair
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
