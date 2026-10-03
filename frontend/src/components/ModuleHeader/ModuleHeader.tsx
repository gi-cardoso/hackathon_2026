import { NavLink } from 'react-router-dom';
import './ModuleHeader.css';

export interface ModuleMenuItem {
  label: string;
  path: string;
}

interface ModuleHeaderProps {
  title: string;
  description?: string;
  menuItems?: ModuleMenuItem[];
}

export function ModuleHeader({ title, description, menuItems = [] }: ModuleHeaderProps) {
  return (
    <div className="module-header-container">
      <div className="module-header-info">
        <h1 className="module-title">{title}</h1>
        {description && <p className="module-description">{description}</p>}
      </div>

      {menuItems.length > 0 && (
        <nav className="module-header-nav">
          <ul className="module-menu-list">
            {menuItems.map((item, index) => (
              <li key={index} className="module-menu-item">
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => `module-menu-link ${isActive ? 'active' : ''}`}
                  end
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
