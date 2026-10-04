import { PrismaClient } from "@prisma/client";
import { VALOR_DIARIA_COMPLETA } from "../boletim/precos";

const TIME_ZONE = "America/Sao_Paulo";

type RecebimentoComDados = {
  id_recebimento: number;
  hora_chegada: Date;
  hora_entrada: Date | null;
  hora_saida: Date | null;
  id_agendamento: number | null;
  agendamento: {
    id_agendamento: number;
    data_agendada: Date;
    horario_agendado: string;
    tipo_acondicionamento: string;
    qtd_chapas_prevista: number | null;
    fornecedor: { id_fornecedor: number; nome_fornecedor: string } | null;
    cargas: Array<{ peso_total: unknown }>;
  } | null;
  descargas: Array<{
    id_armazem: number | null;
    qtd_chapas_utilizados: number;
    armazem: { id_armazem: number; nome_armazem: string } | null;
  }>;
};

type NaoRecebimentoComAgendamento = {
  motivo_padronizado: string;
  agendamento: { data_agendada: Date } | null;
};

function decimalToNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function parseDateParameter(value: unknown, field: string): Date {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${field} deve estar no formato YYYY-MM-DD.`);
  }

  const date = new Date(`${value}T00:00:00-03:00`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`${field} inválida.`);
  }
  return date;
}

function nextDay(date: Date): Date {
  return new Date(date.getTime() + 24 * 60 * 60 * 1000);
}

function dateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function timeKey(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    hour12: false,
  }).format(date);
}

function weekdayKey(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    weekday: "long",
  }).format(date);
}

function percentage(value: number, total: number): number {
  return total > 0 ? round((value / total) * 100) : 0;
}

export class DashboardService {
  static async getOperationalData(
    prisma: PrismaClient,
    input: { dataInicio: unknown; dataFim: unknown; idArmazem?: unknown },
  ) {
    const inicio = parseDateParameter(input.dataInicio, "data_inicio");
    const fimInclusivo = parseDateParameter(input.dataFim, "data_fim");
    const fim = nextDay(fimInclusivo);
    if (inicio > fimInclusivo) {
      throw new Error("data_inicio não pode ser posterior a data_fim.");
    }

    let idArmazem: number | undefined;
    if (input.idArmazem !== undefined) {
      idArmazem = Number(input.idArmazem);
      if (!Number.isInteger(idArmazem) || idArmazem <= 0) {
        throw new Error("id_armazem deve ser um inteiro positivo.");
      }
    }

    const recebimentos = await prisma.recebimento.findMany({
      where: {
        hora_chegada: { gte: inicio, lt: fim },
        ...(idArmazem
          ? { descargas: { some: { id_armazem: idArmazem } } }
          : {}),
      },
      include: {
        agendamento: {
          select: {
            id_agendamento: true,
            data_agendada: true,
            horario_agendado: true,
            tipo_acondicionamento: true,
            qtd_chapas_prevista: true,
            fornecedor: {
              select: { id_fornecedor: true, nome_fornecedor: true },
            },
            cargas: { select: { peso_total: true } },
          },
        },
        descargas: {
          select: {
            id_armazem: true,
            qtd_chapas_utilizados: true,
            armazem: { select: { id_armazem: true, nome_armazem: true } },
          },
        },
      },
      orderBy: { hora_chegada: "asc" },
    }) as RecebimentoComDados[];

    const naoRecebimentos = await prisma.naoRecebimento.findMany({
      where: {
        agendamento: {
          ...(idArmazem
            ? { cargas: { some: { destinos: { some: { id_armazem: idArmazem } } } } }
            : {}),
          data_agendada: { gte: inicio, lt: fim },
        },
      },
      select: {
        motivo_padronizado: true,
        agendamento: { select: { data_agendada: true } },
      },
    }) as NaoRecebimentoComAgendamento[];

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        data_agendada: { gte: inicio, lt: fim },
        ...(idArmazem
          ? { cargas: { some: { destinos: { some: { id_armazem: idArmazem } } } } }
          : {}),
      },
      select: {
        horario_agendado: true,
        data_agendada: true,
      },
    });

    const boletins = await prisma.boletimDiario.findMany({
      where: {
        data: { gte: inicio, lt: fim },
        ...(idArmazem ? { id_armazem: idArmazem } : {}),
      },
      select: {
        id_armazem: true,
        diarias_equivalentes_total: true,
        valor_produzido_total: true,
        complemento_diaria_pago: true,
        armazem: { select: { id_armazem: true, nome_armazem: true } },
      },
    });

    const recebimentosConcluidos = recebimentos.filter(
      (item) => item.hora_entrada && item.hora_saida && item.descargas.length > 0,
    );
    const cargaPeso = (item: RecebimentoComDados) =>
      item.agendamento?.cargas.reduce(
        (total, carga) => total + decimalToNumber(carga.peso_total),
        0,
      ) ?? 0;
    const descarga = (item: RecebimentoComDados) => item.descargas[0];
    const totalPeso = recebimentosConcluidos.reduce((sum, item) => sum + cargaPeso(item), 0);
    const totalChapasUtilizados = recebimentosConcluidos.reduce(
      (sum, item) => sum + (descarga(item)?.qtd_chapas_utilizados ?? 0),
      0,
    );
    const totalChapasPrevistos = recebimentosConcluidos.reduce(
      (sum, item) => sum + (item.agendamento?.qtd_chapas_prevista ?? 0),
      0,
    );

    const porDia = new Map<string, { quantidade_cargas: number; peso_total_kg: number }>();
    const porArmazem = new Map<number, {
      id_armazem: number; nome_armazem: string; quantidade_cargas: number; peso_total_kg: number;
    }>();
    const fornecedores = new Map<number, {
      id_fornecedor: number; nome_fornecedor: string; quantidade_cargas: number; peso_total_kg: number;
    }>();
    const horarios = new Map<string, { quantidade_agendamentos: number; quantidade_recebimentos: number }>();
    const diasSemana = new Map<string, { quantidade_agendamentos: number; quantidade_recebimentos: number }>();
    const dimensionamentoPorRecebimento: Array<Record<string, unknown>> = [];
    const dimensionamentoPorArmazem = new Map<number, {
      id_armazem: number; nome_armazem: string; chapas_previstos: number; chapas_utilizados: number;
    }>();

    let esperaTotal = 0;
    let descargaTotal = 0;
    let totalComEspera = 0;
    let totalComDescarga = 0;

    for (const agendamento of agendamentos) {
      const horario = horarios.get(agendamento.horario_agendado) ?? {
        quantidade_agendamentos: 0,
        quantidade_recebimentos: 0,
      };
      horario.quantidade_agendamentos += 1;
      horarios.set(agendamento.horario_agendado, horario);

      const dia = dateKey(agendamento.data_agendada);
      const semana = weekdayKey(agendamento.data_agendada);
      const diaAtual = diasSemana.get(semana) ?? {
        quantidade_agendamentos: 0,
        quantidade_recebimentos: 0,
      };
      diaAtual.quantidade_agendamentos += 1;
      diasSemana.set(semana, diaAtual);

      if (!porDia.has(dia)) {
        porDia.set(dia, { quantidade_cargas: 0, peso_total_kg: 0 });
      }
    }

    for (const item of recebimentosConcluidos) {
      const armazem = descarga(item)?.armazem;
      const fornecedor = item.agendamento?.fornecedor;
      const peso = cargaPeso(item);
      const dia = dateKey(item.hora_chegada);
      const hora = timeKey(item.hora_chegada);
      const semana = weekdayKey(item.hora_chegada);
      const utilizados = descarga(item)?.qtd_chapas_utilizados ?? 0;
      const previstos = item.agendamento?.qtd_chapas_prevista ?? 0;

      const diaAtual = porDia.get(dia) ?? { quantidade_cargas: 0, peso_total_kg: 0 };
      diaAtual.quantidade_cargas += 1;
      diaAtual.peso_total_kg += peso;
      porDia.set(dia, diaAtual);

      if (armazem) {
        const atual = porArmazem.get(armazem.id_armazem) ?? {
          ...armazem, quantidade_cargas: 0, peso_total_kg: 0,
        };
        atual.quantidade_cargas += 1;
        atual.peso_total_kg += peso;
        porArmazem.set(armazem.id_armazem, atual);

        const dimensionamento = dimensionamentoPorArmazem.get(armazem.id_armazem) ?? {
          ...armazem, chapas_previstos: 0, chapas_utilizados: 0,
        };
        dimensionamento.chapas_previstos += previstos;
        dimensionamento.chapas_utilizados += utilizados;
        dimensionamentoPorArmazem.set(armazem.id_armazem, dimensionamento);
      }

      if (fornecedor) {
        const atual = fornecedores.get(fornecedor.id_fornecedor) ?? {
          ...fornecedor, quantidade_cargas: 0, peso_total_kg: 0,
        };
        atual.quantidade_cargas += 1;
        atual.peso_total_kg += peso;
        fornecedores.set(fornecedor.id_fornecedor, atual);
      }

      const horario = horarios.get(hora) ?? {
        quantidade_agendamentos: 0,
        quantidade_recebimentos: 0,
      };
      horario.quantidade_recebimentos += 1;
      horarios.set(hora, horario);
      const diaAtualSemana = diasSemana.get(semana) ?? {
        quantidade_agendamentos: 0, quantidade_recebimentos: 0,
      };
      diaAtualSemana.quantidade_recebimentos += 1;
      diasSemana.set(semana, diaAtualSemana);

      const espera = (item.hora_entrada!.getTime() - item.hora_chegada.getTime()) / 60000;
      const tempoDescarga = (item.hora_saida!.getTime() - item.hora_entrada!.getTime()) / 60000;
      esperaTotal += espera;
      descargaTotal += tempoDescarga;
      totalComEspera += 1;
      totalComDescarga += 1;

      const diferenca = utilizados - previstos;
      dimensionamentoPorRecebimento.push({
        id_recebimento: item.id_recebimento,
        id_agendamento: item.id_agendamento,
        data: dia,
        id_armazem: armazem?.id_armazem ?? null,
        fornecedor: fornecedor?.nome_fornecedor ?? null,
        qtd_chapas_prevista: previstos,
        qtd_chapas_utilizados: utilizados,
        diferenca,
        situacao: diferenca > 0
          ? "ALOCACAO_ACIMA_DO_PREVISTO"
          : diferenca < 0 ? "ALOCACAO_ABAIXO_DO_PREVISTO" : "ADEQUADO",
      });
    }

    const custosPorArmazem = new Map<number, { diarias_equivalentes: number; custo_estimado: number }>();
    let diariasBoletim = 0;
    let custoBoletim = 0;
    for (const boletim of boletins) {
      const diarias = decimalToNumber(boletim.diarias_equivalentes_total);
      const valorProduzido = decimalToNumber(boletim.valor_produzido_total);
      const complemento = decimalToNumber(boletim.complemento_diaria_pago);
      diariasBoletim += diarias;
      custoBoletim += valorProduzido + complemento;
      if (boletim.id_armazem) {
        const atual = custosPorArmazem.get(boletim.id_armazem) ?? {
          diarias_equivalentes: 0, custo_estimado: 0,
        };
        atual.diarias_equivalentes += diarias;
        atual.custo_estimado += valorProduzido + complemento;
        custosPorArmazem.set(boletim.id_armazem, atual);
      }
    }

    const motivos = new Map<string, number>();
    for (const item of naoRecebimentos) {
      motivos.set(item.motivo_padronizado, (motivos.get(item.motivo_padronizado) ?? 0) + 1);
    }
    const chapasDiferenca = totalChapasUtilizados - totalChapasPrevistos;
    const custoEstimadoOperacional = totalChapasUtilizados * VALOR_DIARIA_COMPLETA;
    const horarioPico = [...horarios.entries()]
      .sort(([, a], [, b]) => b.quantidade_recebimentos - a.quantidade_recebimentos)[0];
    const diaPico = [...diasSemana.entries()]
      .sort(([, a], [, b]) => b.quantidade_recebimentos - a.quantidade_recebimentos)[0];
    const porArmazemResposta = [...porArmazem.values()].map((item) => ({
      ...item,
      percentual_do_total: percentage(item.quantidade_cargas, recebimentosConcluidos.length),
      peso_total_kg: round(item.peso_total_kg),
    }));

    return {
      periodo: {
        data_inicio: String(input.dataInicio),
        data_fim: String(input.dataFim),
        timezone: TIME_ZONE,
      },
      filtros: { id_armazem: idArmazem ?? null },
      resumo: {
        cargas_recebidas: recebimentosConcluidos.length,
        recebimentos_concluidos: recebimentosConcluidos.length,
        nao_recebimentos: naoRecebimentos.length,
        peso_total_recebido_kg: round(totalPeso),
        fornecedores_atendidos: fornecedores.size,
        armazens_utilizados: porArmazem.size,
      },
      cargas_recebidas_por_dia: [...porDia.entries()].map(([data, item]) => ({
        data, ...item, peso_total_kg: round(item.peso_total_kg),
      })),
      cargas_recebidas_por_armazem: porArmazemResposta,
      tempos_operacionais: {
        tempo_medio_espera_minutos: round(totalComEspera ? esperaTotal / totalComEspera : 0),
        tempo_medio_descarga_minutos: round(totalComDescarga ? descargaTotal / totalComDescarga : 0),
        tempo_medio_total_no_armazem_minutos: round(
          totalComEspera && totalComDescarga ? (esperaTotal + descargaTotal) / totalComEspera : 0,
        ),
      },
      colaboradores_por_recebimento: {
        media_chapas_por_recebimento: round(
          recebimentosConcluidos.length ? totalChapasUtilizados / recebimentosConcluidos.length : 0,
        ),
        menor_quantidade: recebimentosConcluidos.length
          ? Math.min(...recebimentosConcluidos.map((item) => descarga(item)?.qtd_chapas_utilizados ?? 0)) : 0,
        maior_quantidade: recebimentosConcluidos.length
          ? Math.max(...recebimentosConcluidos.map((item) => descarga(item)?.qtd_chapas_utilizados ?? 0)) : 0,
        distribuicao: [...new Set(recebimentosConcluidos.map((item) => descarga(item)?.qtd_chapas_utilizados ?? 0))]
          .sort((a, b) => a - b)
          .map((qtd_chapas) => ({
            qtd_chapas,
            quantidade_recebimentos: recebimentosConcluidos.filter(
              (item) => (descarga(item)?.qtd_chapas_utilizados ?? 0) === qtd_chapas,
            ).length,
          })),
      },
      utilizacao_locais_descarga: porArmazemResposta.map((item) => ({
        ...item,
        metodologia: "Percentual dos recebimentos concluídos por local; capacidade física não cadastrada.",
      })),
      fornecedores_com_maior_volume: [...fornecedores.values()]
        .sort((a, b) => b.peso_total_kg - a.peso_total_kg)
        .map((item) => ({
          ...item,
          peso_total_kg: round(item.peso_total_kg),
          percentual_do_total: percentage(item.peso_total_kg, totalPeso),
        })),
      movimento: {
        por_horario: [...horarios.entries()].sort(([a], [b]) => a.localeCompare(b))
          .map(([horario, item]) => ({ horario, ...item })),
        por_dia_semana: [...diasSemana.entries()].map(([dia_semana, item]) => ({
          dia_semana, ...item,
        })),
        horario_de_maior_movimento: horarioPico
          ? { horario: horarioPico[0], ...horarioPico[1] }
          : null,
        dia_de_maior_movimento: diaPico
          ? { dia_semana: diaPico[0], ...diaPico[1] }
          : null,
      },
      nao_recebimentos: {
        total: naoRecebimentos.length,
        por_motivo: [...motivos.entries()].sort(([, a], [, b]) => b - a)
          .map(([motivo, quantidade]) => ({
            motivo, quantidade, percentual: percentage(quantidade, naoRecebimentos.length),
          })),
        metodologia_data: "Agrupamento por Agendamento.data_agendada; NaoRecebimento não possui data própria.",
      },
      custo_estimado_mao_de_obra: {
        valor_total: round(custoEstimadoOperacional, 4),
        moeda: "BRL",
        criterio: "Estimativa: quantidade de chapas utilizados multiplicada pelo valor da diária completa; sem equipamentos e encargos.",
        recebimentos_considerados: recebimentosConcluidos.length,
        valor_diaria_completa: VALOR_DIARIA_COMPLETA,
        por_armazem: [...dimensionamentoPorArmazem.values()].map((item) => ({
          id_armazem: item.id_armazem,
          nome_armazem: item.nome_armazem,
          custo_estimado: round(
            (item.chapas_utilizados * VALOR_DIARIA_COMPLETA),
            4,
          ),
        })),
        boletins: {
          custo_registrado: round(custoBoletim, 4),
          diarias_equivalentes: round(diariasBoletim, 2),
          observacao: "Valor apurado dos boletins no período; boletins não possuem vínculo direto com recebimentos.",
        },
      },
      dimensionamento_chapas: {
        chapas_previstos_total: totalChapasPrevistos,
        chapas_utilizados_total: totalChapasUtilizados,
        diferenca_total: chapasDiferenca,
        situacao_geral: chapasDiferenca > 0
          ? "ALOCACAO_ACIMA_DO_PREVISTO"
          : chapasDiferenca < 0 ? "ALOCACAO_ABAIXO_DO_PREVISTO" : "ADEQUADO",
        percentual_desvio: percentage(Math.abs(chapasDiferenca), totalChapasPrevistos),
        media_prevista_por_recebimento: round(
          recebimentosConcluidos.length ? totalChapasPrevistos / recebimentosConcluidos.length : 0,
        ),
        media_utilizada_por_recebimento: round(
          recebimentosConcluidos.length ? totalChapasUtilizados / recebimentosConcluidos.length : 0,
        ),
        por_recebimento: dimensionamentoPorRecebimento,
        por_armazem: [...dimensionamentoPorArmazem.values()].map((item) => {
          const diferenca = item.chapas_utilizados - item.chapas_previstos;
          return {
            ...item,
            diferenca,
            situacao: diferenca > 0
              ? "ALOCACAO_ACIMA_DO_PREVISTO"
              : diferenca < 0 ? "ALOCACAO_ABAIXO_DO_PREVISTO" : "ADEQUADO",
          };
        }),
      },
      qualidade_dos_dados: {
        recebimentos_sem_qtd_chapas: recebimentos.filter((item) => !descarga(item)).length,
        recebimentos_sem_hora_chegada: 0,
        recebimentos_sem_hora_entrada: recebimentos.length - recebimentosConcluidos.length,
        recebimentos_sem_hora_saida: recebimentos.length - recebimentosConcluidos.length,
        agendamentos_sem_previsao_de_chapas: recebimentosConcluidos.filter(
          (item) => item.agendamento?.qtd_chapas_prevista === null ||
            item.agendamento?.qtd_chapas_prevista === undefined,
        ).length,
        boletins_sem_vinculo_com_recebimento: boletins.length,
      },
    };
  }
}
