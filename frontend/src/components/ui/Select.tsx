import type { SelectHTMLAttributes } from 'react';
import './ui.css';

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`ui-select ${className}`} {...props}>{children}</select>;
}