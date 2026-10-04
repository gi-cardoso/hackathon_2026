import { useEffect, useState } from 'react';
import { Breadcrumb } from '../../../components/Breadcrumb';
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
          { label: 'BI' },
          { label: 'Indicadores' },
        ]}
      />
      <PageContent>
        <div className="bi-heading">
          <div>
            <span className="page-eyebrow">Visão Geral</span>
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
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                required
              />
            </label>
            <label>
              Data de Fim
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
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
                        <th>% Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.cargas_recebidas_por_armazem.map((item) => (
                        <tr key={item.id_armazem}>
                          <td>{item.nome_armazem}</td>
                          <td>{item.quantidade_cargas}</td>
                          <td>{formatDecimal(item.peso_total_kg)}</td>
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


          </div>
        )}
      </PageContent>
    </>
  );
}
