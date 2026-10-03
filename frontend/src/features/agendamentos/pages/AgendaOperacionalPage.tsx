import { useEffect, useState } from 'react';
import { Breadcrumb } from '../../../components/Breadcrumb';
import { PageContent } from '../../../components/layout/PageContent';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { api } from '../../../services/api';
import '../styles.css';

interface AgendaItem { id_agendamento: number; data_agendada: string; horario_agendado: string; status_agendamento: string; fornecedor?: { nome_fornecedor?: string }; }

export function AgendaOperacionalPage() {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [error, setError] = useState('');
  useEffect(() => { api.get<AgendaItem[]>('/agendamentos/analise/compras').then((response) => setItems(response.data)).catch(() => setError('Não foi possível carregar a agenda.')); }, []);
  const slots = ['08:00', '10:00', '13:00', '15:00'];
  return (
    <>
      <Breadcrumb items={[{ label: 'Início', path: '/agendamentos' }, { label: 'Agendamentos' }, { label: 'Agenda operacional' }]} />
      <PageContent>
        <span className="page-eyebrow">Visão do dia</span><h2>Agenda operacional</h2><p className="agendamentos-intro">Pedidos pendentes organizados por janela de recebimento.</p>{error && <div className="internal-alert" role="alert">{error}</div>}<div className="agenda-grid">{slots.map((slot) => <Card key={slot}><div className="agenda-slot-header"><h3>{slot}</h3><span>{items.filter((item) => item.horario_agendado === slot).length} pedidos</span></div>{items.filter((item) => item.horario_agendado === slot).length === 0 ? <p className="agenda-muted">Nenhum caminhão neste horário.</p> : items.filter((item) => item.horario_agendado === slot).map((item) => <div className="agenda-item" key={item.id_agendamento}><strong>{item.fornecedor?.nome_fornecedor || 'Fornecedor'}</strong><StatusBadge status={item.status_agendamento} /></div>)}</Card>)}</div>{items.length === 0 && !error && <EmptyState title="Agenda sem pedidos" description="Os agendamentos pendentes aparecerão aqui quando forem enviados para análise." />}
      </PageContent>
    </>
  );
}
