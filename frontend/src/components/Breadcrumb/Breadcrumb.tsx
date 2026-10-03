import { Link } from 'react-router-dom';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length < 2) {
    return null;
  }

  return (
    <nav className="breadcrumb" aria-label="Navegação estrutural">
      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="breadcrumb-item">
              {!isCurrent && item.path ? (
                <Link className="breadcrumb-link" to={item.path}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isCurrent ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!isCurrent && <span className="breadcrumb-separator" aria-hidden="true">&gt;</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
