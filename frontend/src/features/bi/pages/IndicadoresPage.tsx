import { useEffect, useState } from 'react';
import { Breadcrumb } from '../../../components/Breadcrumb';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PageContent } from '../../../components/layout/PageContent';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { getApiError, getDashboardOperacao } from '../../../services/api';
import type { DashboardOperacaoResponse } from '../../../services/api';
import './styles.css';

function formatDecimal(value: number) {
  return Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

function formatPercent(value: number) {
  return `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
}

function StatCard({ label, value, subtitle }: { label: string; value: string | number; subtitle?: string }) {
  return (
    <Card className="stat-card">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {subtitle && <span className="stat-subtitle">{subtitle}</span>}
    </Card>
  );
}

export function IndicadoresPage() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState<DashboardOperacaoResponse | null>(null);

  useEffect(() => {
    // Set default dates to current month
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const pad = (n: number) => n.toString().padStart(2, '0');
    setDataInicio(`${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`);
    setDataFim(`${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`);
  }, []);

  const fetchDashboard = async () => {
    if (!dataInicio || !dataFim) return;
    setLoading(true);
    setError('');
    try {
      const response = await getDashboardOperacao(dataInicio, dataFim);
      setDashboard(response);
    } catch (err: unknown) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dataInicio && dataFim) {
      fetchDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Início', path: '/bi' },
          { label: 'Dashboard' },
          { label: 'Indicadores' },
        ]}
      />
      <PageContent>
        <div className="bi-heading">
          <div>
            
            <h2>Indicadores Operacionais</h2>
            <p>Acompanhe os resultados e o fluxo do armazém e recebimento.</p>
          </div>
        </div>

        <Card className="bi-filters">
          <form
            className="filters-form"
            onSubmit={(e) => {
              e.preventDefault();
              fetchDashboard();
            }}
          >
            <label>
              Data de Início
              <DatePicker
                selected={dataInicio ? new Date(`${dataInicio}T00:00:00`) : null}
                onChange={(d: Date | null) => { if (d) setDataInicio(d.toISOString().split('T')[0]); else setDataInicio(''); }}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecione uma data"
                className="ui-input"
                required
              />
            </label>
            <label>
              Data de Fim
              <DatePicker
                selected={dataFim ? new Date(`${dataFim}T00:00:00`) : null}
                onChange={(d: Date | null) => { if (d) setDataFim(d.toISOString().split('T')[0]); else setDataFim(''); }}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecione uma data"
                className="ui-input"
                required
              />
            </label>
            <Button type="submit" loading={loading} disabled={loading}>
              Atualizar Indicadores
            </Button>
          </form>
        </Card>

        {error && (
          <div className="internal-alert" role="alert">
            {error}
          </div>
        )}

        {dashboard && !loading && (
          <div className="dashboard-content">
            <h3 className="section-title">Resumo da Operação</h3>
            <div className="stats-grid">
              <StatCard label="Cargas Recebidas" value={dashboard.resumo.cargas_recebidas} />
              <StatCard label="Recebimentos Concluídos" value={dashboard.resumo.recebimentos_concluidos} />
              <StatCard label="Não Recebimentos" value={dashboard.resumo.nao_recebimentos} />
              <StatCard label="Fornecedores Atendidos" value={dashboard.resumo.fornecedores_atendidos} />
              <StatCard label="Peso Total Recebido" value={`${formatDecimal(dashboard.resumo.peso_total_recebido_kg)} kg`} />
            </div>

            <div className="dashboard-row">
              <div className="dashboard-col">
                <h3 className="section-title">Tempos Operacionais</h3>
                <Card>
                  <dl className="detail-list">
                    <div>
                      <dt>Tempo Médio de Espera</dt>
                      <dd>{formatDecimal(dashboard.tempos_operacionais.tempo_medio_espera_minutos)} min</dd>
                    </div>
                    <div>
                      <dt>Tempo Médio de Descarga</dt>
                      <dd>{formatDecimal(dashboard.tempos_operacionais.tempo_medio_descarga_minutos)} min</dd>
                    </div>
                    <div>
                      <dt>Tempo Médio Total no Armazém</dt>
                      <dd>{formatDecimal(dashboard.tempos_operacionais.tempo_medio_total_no_armazem_minutos)} min</dd>
                    </div>
                  </dl>
                </Card>
              </div>

              <div className="dashboard-col">
                <h3 className="section-title">Custo Estimado Mão de Obra</h3>
                <Card>
                  <dl className="detail-list">
                    <div>
                      <dt>Valor Total Estimado</dt>
                      <dd>R$ {formatDecimal(dashboard.custo_estimado_mao_de_obra.valor_total)}</dd>
                    </div>
                    <div>
                      <dt>Custo Boletins Registrado</dt>
                      <dd>R$ {formatDecimal(dashboard.custo_estimado_mao_de_obra.boletins.custo_registrado)}</dd>
                    </div>
                    <div>
                      <dt>Diárias Equivalentes</dt>
                      <dd>{formatDecimal(dashboard.custo_estimado_mao_de_obra.boletins.diarias_equivalentes)}</dd>
                    </div>
                  </dl>
                </Card>
              </div>
            </div>

            <div className="dashboard-row">
              <div className="dashboard-col">
                <h3 className="section-title">Recebimentos por Armazém</h3>
                <Card className="table-card">
                  <table className="ui-table">
                    <thead>
                      <tr>
                        <th>Armazém</th>
                        <th>Cargas</th>
                        <th>Peso (kg)</th>
                        <th>Diárias Pagas</th>
                        <th>% Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.cargas_recebidas_por_armazem.map((item) => (
                        <tr key={item.id_armazem}>
                          <td>{item.nome_armazem}</td>
                          <td>{item.quantidade_cargas}</td>
                          <td>{formatDecimal(item.peso_total_kg)}</td>
                          <td>{formatDecimal(item.diarias_pagas || 0)}</td>
                          <td>{formatPercent(item.percentual_do_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>

              <div className="dashboard-col">
                <h3 className="section-title">Top Fornecedores (Volume)</h3>
                <Card className="table-card">
                  <table className="ui-table">
                    <thead>
                      <tr>
                        <th>Fornecedor</th>
                        <th>Cargas</th>
                        <th>Peso (kg)</th>
                        <th>% Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.fornecedores_com_maior_volume.slice(0, 5).map((item) => (
                        <tr key={item.id_fornecedor}>
                          <td>{item.nome_fornecedor}</td>
                          <td>{item.quantidade_cargas}</td>
                          <td>{formatDecimal(item.peso_total_kg)}</td>
                          <td>{formatPercent(item.percentual_do_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            </div>

            <div className="dashboard-row">
              <div className="dashboard-col">
                <h3 className="section-title">Cargas por Dia</h3>
                <Card className="table-card">
                  <table className="ui-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Cargas</th>
                        <th>Peso (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.cargas_recebidas_por_dia.map((item) => (
                        <tr key={item.data}>
                          <td>{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                          <td>{item.quantidade_cargas}</td>
                          <td>{formatDecimal(item.peso_total_kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>

              <div className="dashboard-col">
                <h3 className="section-title">Não Recebimentos (Motivos)</h3>
                <Card className="table-card">
                  <table className="ui-table">
                    <thead>
                      <tr>
                        <th>Motivo</th>
                        <th>Quantidade</th>
                        <th>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.nao_recebimentos.por_motivo.map((item) => (
                        <tr key={item.motivo}>
                          <td>{item.motivo.replace(/_/g, ' ')}</td>
                          <td>{item.quantidade}</td>
                          <td>{formatPercent(item.percentual)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            </div>

            <h3 className="section-title">Análise de Movimento</h3>
            <div className="dashboard-row">
              <div className="dashboard-col">
                <Card>
                  <dl className="detail-list">
                    <div>
                      <dt>Dia de Maior Movimento</dt>
                      <dd>{dashboard.movimento.dia_de_maior_movimento?.dia_semana || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt>Horário de Maior Movimento</dt>
                      <dd>{dashboard.movimento.horario_de_maior_movimento?.horario || 'N/A'}</dd>
                    </div>
                  </dl>
                </Card>
              </div>
              
              <div className="dashboard-col">
                <Card>
                  <dl className="detail-list">
                    <div>
                      <dt>Média de Chapas por Recebimento</dt>
                      <dd>{formatDecimal(dashboard.colaboradores_por_recebimento.media_chapas_por_recebimento)} chapas</dd>
                    </div>
                    <div>
                      <dt>Mínimo / Máximo (Chapas)</dt>
                      <dd>{dashboard.colaboradores_por_recebimento.menor_quantidade} / {dashboard.colaboradores_por_recebimento.maior_quantidade}</dd>
                    </div>
                  </dl>
                </Card>
              </div>
            </div>
            <h3 className="section-title">Como chegamos na Sobra ou Falta? (Variáveis do Algoritmo)</h3>
            <div className="dashboard-row">
              <div className="dashboard-col">
                <Card>
                  <h4 style={{marginBottom: '1rem', color: 'var(--color-text-muted)'}}>Variáveis de Ociosidade (Sobra de Chapa)</h4>
                  <dl className="detail-list">
                    <div>
                      <dt>Produção Total Alcançada (R$)</dt>
                      <dd>R$ {formatDecimal(dashboard.analise_chapas?.producao_total || 0)}</dd>
                      <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted)' }}>Conta: Soma das taxas de carga/descarga no Boletim</span>
                    </div>
                    <div>
                      <dt>Garantia Mínima da Equipe (R$)</dt>
                      <dd>R$ {formatDecimal(dashboard.analise_chapas?.garantia_minima || 0)}</dd>
                      <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted)' }}>Conta: Diárias Equivalentes × R$ 90,17 (Piso)</span>
                    </div>
                    <div>
                      <dt>Sobra Financeira / Prejuízo (R$)</dt>
                      <dd>R$ {formatDecimal(dashboard.analise_chapas?.prejuizo_estimado || 0)}</dd>
                      <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted)' }}>Conta: Garantia Mínima − Produção Total</span>
                    </div>
                    <div>
                      <dt>Diárias Equivalentes Pagas</dt>
                      <dd>{formatDecimal(dashboard.analise_chapas?.diarias_equivalentes_boletim || 0)} diárias</dd>
                      <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted)' }}>Conta: 1 por pessoa, subtraindo 0.5 em saídas antecipadas</span>
                    </div>
                    <div>
                      <dt>Sobra de Pessoas (Ociosos)</dt>
                      <dd>{formatDecimal(dashboard.analise_chapas?.sobra_em_pessoas || 0)} pessoas</dd>
                      <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted)' }}>Conta: Diárias Pagas − (Produção Total ÷ R$ 90,17)</span>
                    </div>
                  </dl>
                  <p style={{ marginTop: '1rem', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    <em>* Se a Produção for menor que a Garantia Mínima, a cooperativa paga a diferença (Complemento/Prejuízo). O sistema então calcula exatamente quantos chapas sobraram baseado nesse valor pago a mais.</em>
                  </p>
                </Card>
              </div>
              <div className="dashboard-col">
                <Card>
                  <h4 style={{marginBottom: '1rem', color: 'var(--color-text-muted)'}}>Variáveis de Gargalo (Falta de Chapa)</h4>
                  <dl className="detail-list">
                    <div>
                      <dt>Caminhões Retidos (Dia Seguinte)</dt>
                      <dd>{dashboard.analise_chapas?.cargas_retidas || 0} caminhões</dd>
                      <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted)' }}>Conta: Veículos em que Data(Chegada) ≠ Data(Entrada)</span>
                    </div>
                    <div>
                      <dt>Tempo Médio de Espera</dt>
                      <dd>{formatDecimal(dashboard.tempos_operacionais.tempo_medio_espera_minutos)} min</dd>
                      <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted)' }}>Conta: Diferença em minutos entre Chegada e Entrada de todas as cargas</span>
                    </div>
                    <div>
                      <dt>Status de Tolerância de Gargalo</dt>
                      <dd>
                        {dashboard.analise_chapas && (dashboard.analise_chapas.cargas_retidas > 0 || dashboard.tempos_operacionais.tempo_medio_espera_minutos > 120)
                          ? <span style={{ color: '#b45309', fontWeight: 'bold' }}>Ultrapassou o Limite</span>
                          : <span style={{ color: '#047857', fontWeight: 'bold' }}>Dentro da Normalidade</span>
                        }
                      </dd>
                      <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted)' }}>Conta: Retidos {'>'} 0 OU Espera {'>'} 120 min</span>
                    </div>
                    <div>
                      <dt>Status Operacional Final</dt>
                      <dd style={{ fontWeight: 'bold' }}>
                        {dashboard.analise_chapas?.status_gargalo.replace(/_/g, ' ')}
                      </dd>
                      <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted)' }}>Conta: Resultado direto da árvore de decisão de Sobra x Falta</span>
                    </div>
                  </dl>
                  <p style={{ marginTop: '1rem', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    <em>* Mesmo se a equipe se pagar (Produção {'>'} Garantia), o sistema acusa "FALTA DE CHAPA" caso ocorra retenção de caminhões (caminhão entra em um dia e descarrega no outro) ou a espera passe de 2 horas.</em>
                  </p>
                </Card>
              </div>
            </div>

          </div>
        )}
      </PageContent>
    </>
  );
}
