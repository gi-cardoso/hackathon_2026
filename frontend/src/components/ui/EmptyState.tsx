import type { ReactNode } from 'react';
import { Logo } from '../Logo';
import './ui.css';
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="ui-empty-state"><Logo variant="symbol" height="32px" /><h3>{title}</h3><p>{description}</p>{action}</div>; }
