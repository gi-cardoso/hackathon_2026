import type { HTMLAttributes, ReactNode } from 'react';
import './ui.css';

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return <section className={`ui-card ${className}`} {...props}>{children}</section>;
}
