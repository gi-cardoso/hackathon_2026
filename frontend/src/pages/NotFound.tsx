import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';

export function NotFound() {
  return <main className="page-content"><Card><span className="page-eyebrow">Erro 404</span><h1>Página não encontrada</h1><p>O endereço informado não existe neste portal.</p><Link className="ui-button ui-button-primary" to="/compras">Voltar ao início</Link></Card></main>;
}