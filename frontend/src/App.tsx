import './App.css'

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <div className="container header-content">
          <div className="brand">
            COCAPEC <span className="brand-badge">Sistema Base</span>
          </div>
        </div>
      </header>

      <main className="main-content container">
        <h1 style={{ marginBottom: '0.5rem' }}>Bem-vindo ao Sistema COCAPEC</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
          Este é o padrão visual corporativo (base) que será utilizado pelas aplicações.
        </p>

        <div className="grid">
          {/* Card 1 */}
          <div className="card">
            <h2 className="card-title">Tipografia e Cores</h2>
            <p className="card-text">
              Utilizamos uma paleta focada em verde (referência agrícola/café) e tons de terra, com fundos claros para leitura confortável e alto contraste.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: 'var(--color-primary)' }}></div>
              <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: 'var(--color-secondary)' }}></div>
              <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: 'var(--color-text-primary)' }}></div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="card">
            <h2 className="card-title">Componentes</h2>
            <p className="card-text">
              Exemplo de aparência uniforme para botões e interações base.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary">Ação Principal</button>
              <button className="btn btn-outline">Secundário</button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="card">
            <h2 className="card-title">Responsividade</h2>
            <p className="card-text">
              A estrutura adapta-se automaticamente a telas menores usando flexbox e grid. Tente redimensionar a janela.
            </p>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <div>
            &copy; 2026 COCAPEC. Todos os direitos reservados.
          </div>
          <div className="footer-links">
            <a href="#">Suporte</a>
            <a href="#">Termos de Uso</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
