import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { Main } from './Main';
import './AppLayout.css';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-wrapper">
        <Header />
        <Main>
          {children}
        </Main>
      </div>
    </div>
  );
}
