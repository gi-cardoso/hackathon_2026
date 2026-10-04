import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../../../components/Breadcrumb';
import { PageContent } from '../../../components/layout/PageContent';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { getAgendamentosOperacao } from '../../../services/api';
import type { AgendamentoOperacao } from '../../../services/api';
import '../styles.css';

export function AgendaOperacionalPage() {
  const [items, setItems] = useState<AgendamentoOperacao[]>([]);
  const [error, setError] = useState('');
  const [view, setView] = useState<'dia' | 'semana' | 'mes'>('dia');

  useEffect(() => { getAgendamentosOperacao().then((response) => setItems(response)).catch(() => setError('Não foi possível carregar a agenda.')); }, []);

  let slots: string[] = [];
  if (view === 'dia') {
    slots = ['08:00', '10:00', '13:00', '15:00'];
  } else if (view === 'semana') {
    let daysAdded = 0;
    let offset = 1;
    while (daysAdded < 5) {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        slots.push(d.toISOString().split('T')[0]);
        daysAdded++;
      }
      offset++;
    }
  } else if (view === 'mes') {
    slots = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
  }

  const formatWeekSlot = (dateStr: string) => {
    const d = new Date(`${dateStr}T00:00:00`);
    const weekDay = d.toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'UTC' });
    return `${weekDay.charAt(0).toUpperCase() + weekDay.slice(1)} (${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })})`;
  };

  const getSlotItems = (slot: string) => {
    if (view === 'dia') {
      const localTodayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
      return items.filter(i => i.horario_agendado === slot && i.data_agendada.startsWith(localTodayStr));
    }
    if (view === 'semana') {
      return items.filter(i => i.data_agendada.startsWith(slot));
    }
    if (view === 'mes') {
      const semanaNum = parseInt(slot.replace('Semana ', ''));
      return items.filter(i => {
        const date = new Date(i.data_agendada).getUTCDate();
        return Math.ceil(date / 7) === semanaNum || (semanaNum === 4 && date > 28);
      });
    }
    return [];
  };

  return (
    <>
      <Breadcrumb items={[{ label: 'Início', path: '/agendamentos' }, { label: 'Agendamentos' }, { label: 'Agenda operacional' }]} />
      <PageContent>
        <div className="page-heading-row">
           <div>
             <h2>Agenda operacional</h2>
             <p className="agendamentos-intro">Pedidos pendentes organizados por {view === 'dia' ? 'janela de recebimento' : view === 'semana' ? 'dia da semana' : 'semana do mês'}.</p>
           </div>
           <div className="filter-control" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center', minWidth: 'auto' }}>
              <Button type="button" variant={view === 'dia' ? 'primary' : 'ghost'} onClick={() => setView('dia')}>Hoje</Button>
              <Button type="button" variant={view === 'semana' ? 'primary' : 'ghost'} onClick={() => setView('semana')}>Semana</Button>
              <Button type="button" variant={view === 'mes' ? 'primary' : 'ghost'} onClick={() => setView('mes')}>Mês</Button>
           </div>
        </div>
        {error && <div className="internal-alert" role="alert">{error}</div>}
        <div className="agenda-grid">
           {slots.map((slot) => {
             const slotItems = getSlotItems(slot);
             const slotTitle = view === 'semana' ? formatWeekSlot(slot) : slot;
             return (
               <Card key={slot}>
                 <div className="agenda-slot-header">
                   <h3>{slotTitle}</h3>
                   <span>{slotItems.length} pedidos</span>
                 </div>
                 {slotItems.length === 0 ? (
                   <p className="agenda-muted">Nenhum caminhão {view === 'dia' ? 'neste horário' : 'neste período'}.</p>
                 ) : (
                   slotItems.map((item) => (
                     <details className="agenda-item-accordion" key={item.id_agendamento}>
                       <summary>
                         <div className="agenda-item">
                           <div className="agenda-item-info">
                             <div className="mini-calendar">
                               <div className="mini-calendar-month">{new Date(item.data_agendada).toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '').substring(0,3).toUpperCase()}</div>
                               <div className="mini-calendar-day">{new Date(item.data_agendada).toLocaleDateString('pt-BR', { day: '2-digit', timeZone: 'UTC' })}</div>
                             </div>
                             <strong>{item.fornecedor?.nome_fornecedor || 'Fornecedor'}</strong>
                           </div>
                           <StatusBadge status={item.status_agendamento} />
                         </div>
                       </summary>
                       <div className="agenda-item-content">
                         <p><strong>Horário agendado:</strong> {item.horario_agendado}</p>
                         <p><strong>Data:</strong> {new Date(item.data_agendada).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                         <div className="agenda-item-content-actions">
                           <Link to={`/agendamentos/${item.id_agendamento}`} className="ui-button ui-button-ghost" style={{ fontSize: '0.8rem', padding: '0 8px', minHeight: '32px' }}>Ver detalhes completos</Link>
                         </div>
                       </div>
                     </details>
                   ))
                 )}
               </Card>
             );
           })}
        </div>
        {items.length === 0 && !error && <EmptyState title="Agenda sem pedidos" description="Os agendamentos pendentes aparecerão aqui quando forem enviados para análise." />}
      </PageContent>
    </>
  );
}
