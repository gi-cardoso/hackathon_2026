import type { ReactNode } from 'react';
import './ui.css';
export function AppShell({ children }: { children: ReactNode }) { return <div className="ui-app-shell">{children}</div>; }
