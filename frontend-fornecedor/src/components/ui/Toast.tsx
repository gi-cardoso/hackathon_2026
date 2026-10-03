import './ui.css';
export function Toast({ message, tone = 'info', onClose }: { message: string; tone?: 'info' | 'success' | 'error'; onClose?: () => void }) { return <div className={`ui-toast ui-toast-${tone}`} role="status"><span>{message}</span>{onClose && <button type="button" onClick={onClose} aria-label="Fechar aviso">Fechar</button>}</div>; }
