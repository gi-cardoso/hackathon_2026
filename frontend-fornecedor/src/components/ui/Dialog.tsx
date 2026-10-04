import { useEffect, type ReactNode } from 'react';
import './ui.css';

interface DialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Dialog({ open, title, onClose, children }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, open]);

  if (!open) return null;
  return <div className="ui-dialog-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="ui-dialog" role="dialog" aria-modal="true" aria-labelledby="ui-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
      <header><h2 id="ui-dialog-title">{title}</h2><button type="button" className="ui-dialog-close" aria-label="Fechar" onClick={onClose}>×</button></header>
      {children}
    </section>
  </div>;
}