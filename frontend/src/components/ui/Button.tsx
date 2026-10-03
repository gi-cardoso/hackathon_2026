import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './ui.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: ButtonVariant; loading?: boolean; children: ReactNode; }
export function Button({ variant = 'primary', loading = false, children, disabled, ...props }: ButtonProps) { return <button className={`ui-button ui-button-${variant}`} disabled={disabled || loading} {...props}>{loading ? 'Carregando...' : children}</button>; }
