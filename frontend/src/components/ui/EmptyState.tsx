import type { ReactNode } from 'react';
import './ui.css';
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="ui-empty-state"><span className="ui-empty-mark" aria-hidden="true">--</span><h3>{title}</h3><p>{description}</p>{action}</div>; }
