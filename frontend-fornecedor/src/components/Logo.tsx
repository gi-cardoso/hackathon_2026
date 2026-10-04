import { useState, type CSSProperties, type SyntheticEvent } from 'react';

export type LogoVariant = 'full' | 'full-dark' | 'symbol';

interface LogoProps {
  variant?: LogoVariant;
  height?: string;
  className?: string;
  onError?: () => void;
}

const sources: Record<LogoVariant, string> = {
  full: 'logo-cocapec.png',
  'full-dark': 'logo-cocapec-fundo-escuro.png',
  symbol: 'simbolo-cocapec-512.png',
};

export function Logo({ variant = 'full', height = 'clamp(28px, 4vw, 44px)', className = '', onError }: LogoProps) {
  const [hasError, setHasError] = useState(false);
  const source = `${import.meta.env.BASE_URL}logos/${sources[variant]}`;
  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.display = 'none';
    setHasError(true);
    onError?.();
  };

  return (
    <span className={`cocapec-logo-wrap ${className}`} style={{ '--logo-height': height } as CSSProperties}>
      <img
        className="cocapec-logo"
        src={source}
        alt="COCAPEC, o melhor café está aqui"
        loading="eager"
        draggable={false}
        onError={handleError}
      />
      {hasError && <span className="cocapec-logo-fallback" role="img" aria-label="COCAPEC, o melhor café está aqui">COCAPEC</span>}
    </span>
  );
}