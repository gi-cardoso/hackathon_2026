export function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">COCAPEC</div>
      <nav className="sidebar-nav">
        <ul>
          <li><a href="#dashboard">Dashboard</a></li>
          <li><a href="#compras">Compras</a></li>
          <li><a href="#armazem">Armazém</a></li>
          <li><a href="#boletim">Boletim</a></li>
          <li><a href="#bi">BI</a></li>
          <li><a href="#admin">Administração</a></li>
        </ul>
      </nav>
    </aside>
  );
}
