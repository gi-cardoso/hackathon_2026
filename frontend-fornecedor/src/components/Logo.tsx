import type { CSSProperties } from 'react';

export type LogoVariant = 'full' | 'full-dark' | 'symbol';

interface LogoProps {
  variant?: LogoVariant;
  height?: string;
  className?: string;
}

const sources: Record<LogoVariant, string> = {
  full: '/logo-cocapec.png',
  'full-dark': '/logo-cocapec-fundo-escuro.png',
  symbol: '/simbolo-cocapec-512.png',
};

export function Logo({ variant = 'full', height = 'clamp(28px, 4vw, 44px)', className = '' }: LogoProps) {
  return (
    <img
      className={`cocapec-logo ${className}`}
      src={sources[variant]}
      alt="COCAPEC, o melhor café está aqui"
      loading="eager"
      style={{ '--logo-height': height } as CSSProperties}
    />
  );
}