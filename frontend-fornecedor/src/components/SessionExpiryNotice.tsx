import { useEffect, useState } from 'react';
import { Toast } from './ui/Toast';

export function SessionExpiryNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleExpired = () => setVisible(true);
    window.addEventListener('cocapec:session-expired', handleExpired);
    return () => window.removeEventListener('cocapec:session-expired', handleExpired);
  }, []);

  return visible ? <Toast tone="error" message="Sua sessão expirou. Faça login novamente." onClose={() => setVisible(false)} /> : null;
}