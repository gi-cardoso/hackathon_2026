import type { ReactNode } from 'react';
import './ui.css';
export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) { return <header className="ui-page-header">{eyebrow && <span>{eyebrow}</span>}<div><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions}</header>; }
