import './Login.css'

export default function Login() {
  return (
    <div className="login-page">
      {/* Visual Identity Section (Hidden on very small mobile, visible on desktop/tablet) */}
      <div className="login-left">
        <h1>COCAPEC</h1>
        <p>Cooperativa de Cafeicultores e Agropecuaristas</p>
      </div>

      {/* Login Form Section */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <div className="login-brand">COCAPEC</div>
            <div className="login-subtitle">Portal Interno</div>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">E-mail corporativo</label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="nome@cocapec.com.br"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Senha</label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className="login-options">
              <a href="#" className="forgot-password">Esqueci minha senha</a>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
