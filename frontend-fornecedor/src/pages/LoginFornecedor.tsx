import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';
import { getApiError } from '../services/api';
import './LoginFornecedor.css';

export default function LoginFornecedor() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [cnpj, setCnpj] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [cnpjError, setCnpjError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Apply CNPJ mask: XX.XXX.XXX/XXXX-XX
  const handleCnpjChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 14) value = value.slice(0, 14);

    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
    value = value.replace(/(\d{4})(\d)/, '$1-$2');

    setCnpj(value);
    if (cnpjError) setCnpjError('');
  };

  const isValidCNPJ = (cnpj: string) => {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;

    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    let digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  };

  const validateForm = () => {
    let isValid = true;
    setCnpjError('');
    setPasswordError('');
    setErrorMsg('');
    setSuccessMsg('');

    const cleanCnpj = cnpj.replace(/\D/g, '');

    if (!cleanCnpj) {
      setCnpjError('O CNPJ é obrigatório');
      isValid = false;
    } else if (cleanCnpj.length < 14) {
      setCnpjError('O CNPJ está incompleto');
      isValid = false;
    } else if (!isValidCNPJ(cnpj)) {
      setCnpjError('CNPJ inválido');
      isValid = false;
    }

    if (!password) {
      setPasswordError('A senha é obrigatória');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await signIn(cnpj, password);
      setSuccessMsg('Login realizado com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error: unknown) {
      setErrorMsg(getApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <Logo variant="full-dark" height="clamp(48px, 8vw, 86px)" />
        <p>Rede Integrada de Fornecedores</p>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <div className="login-brand"><Logo variant="full" height="clamp(34px, 5vw, 48px)" /></div>
            <div className="login-subtitle">Portal do Fornecedor</div>
          </div>

          {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="cnpj" className="form-label">CNPJ</label>
              <input
                type="text"
                id="cnpj"
                className={`form-input ${cnpjError ? 'invalid' : ''}`}
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={handleCnpjChange}
                disabled={isLoading}
              />
              {cnpjError && <span className="input-error-text">{cnpjError}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Senha</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`form-input ${passwordError ? 'invalid' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && <span className="input-error-text">{passwordError}</span>}
            </div>

            <div className="login-options">
              <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>
                Esqueci minha senha
              </a>
            </div>

            <button 
              type="submit" 
              className="btn-block" 
              disabled={isLoading || !!successMsg}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Entrando...</span>
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
