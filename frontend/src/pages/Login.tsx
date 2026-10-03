import { useState } from 'react';
import type { FormEvent } from 'react';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // States for field validation
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setEmailError('O e-mail é obrigatório');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Formato de e-mail inválido');
      isValid = false;
    }

    if (!password) {
      setPasswordError('A senha é obrigatória');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('A senha deve ter no mínimo 6 caracteres');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Mocking an API call delay
    setTimeout(() => {
      setIsLoading(false);
      
      // Simulating a fake validation response (e.g. valid credentials only if admin)
      if (email === 'admin@cocapec.com.br' && password === 'admin123') {
        setSuccessMsg('Login realizado com sucesso! Redirecionando...');
      } else {
        setErrorMsg('Credenciais inválidas. Tente novamente.');
      }
    }, 1500);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h1>COCAPEC</h1>
        <p>Cooperativa de Cafeicultores e Agropecuaristas</p>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <div className="login-brand">COCAPEC</div>
            <div className="login-subtitle">Portal Interno</div>
          </div>

          {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email" className="form-label">E-mail corporativo</label>
              <input
                type="email"
                id="email"
                className={`form-input ${emailError ? 'invalid' : ''}`}
                placeholder="nome@cocapec.com.br"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                disabled={isLoading}
              />
              {emailError && <span className="input-error-text">{emailError}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Senha</label>
              <input
                type="password"
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
              {passwordError && <span className="input-error-text">{passwordError}</span>}
            </div>

            <div className="login-options">
              <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>
                Esqueci minha senha
              </a>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block" 
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
