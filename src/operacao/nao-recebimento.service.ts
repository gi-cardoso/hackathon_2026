import { Prisma, PrismaClient } from "@prisma/client";

export const MOTIVOS_NAO_RECEBIMENTO = [
  "DIVERGENCIA_NOTA_PEDIDO",
  "SEM_AGENDAMENTO_SEM_VAGA",
  "CASO_FORTUITO",
  "OUTRO",
] as const;

export type MotivoNaoRecebimento = (typeof MOTIVOS_NAO_RECEBIMENTO)[number];

export interface RegistrarNaoRecebimentoInput {
  id_agendamento?: unknown;
  motivo_padronizado: unknown;
  observacao?: unknown;
}

const NAO_RECEBIMENTO_INCLUDE = {
  agendamento: {
    include: {
      fornecedor: {
        select: {
          id_fornecedor: true,
          codigo_fornecedor_cocapec: true,
          nome_fornecedor: true,
          cnpj: true,
          contato: true,
          ativo: true,
        },
      },
      nota_fiscal: true,
      cargas: {
        include: {
          itens: true,
          destinos: { include: { armazem: true } },
        },
      },
    },
  },
} satisfies Prisma.NaoRecebimentoInclude;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseId(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("id_agendamento deve ser um inteiro positivo.");
  }
  return id;
}

function parseMotivo(value: unknown): MotivoNaoRecebimento {
  const motivo = text(value).toUpperCase();
  if (!MOTIVOS_NAO_RECEBIMENTO.includes(motivo as MotivoNaoRecebimento)) {
    throw new Error(
      `motivo_padronizado inválido. Use: ${MOTIVOS_NAO_RECEBIMENTO.join(", ")}.`,
    );
  }
  return motivo as MotivoNaoRecebimento;
}

export class NaoRecebimentoService {
  static async create(
    prisma: PrismaClient,
    input: RegistrarNaoRecebimentoInput,
  ) {
    const motivo = parseMotivo(input.motivo_padronizado);
    const idAgendamento = parseId(input.id_agendamento);
    const observacao = text(input.observacao);

    if (motivo === "OUTRO" && !observacao) {
      throw new Error("observacao é obrigatória quando o motivo for OUTRO.");
    }
    if (motivo === "SEM_AGENDAMENTO_SEM_VAGA" && idAgendamento) {
      throw new Error(
        "SEM_AGENDAMENTO_SEM_VAGA não pode possuir id_agendamento.",
      );
    }
    if (motivo !== "SEM_AGENDAMENTO_SEM_VAGA" && !idAgendamento) {
      throw new Error(
        "id_agendamento é obrigatório para este motivo de não recebimento.",
      );
    }

    return prisma.$transaction(async (tx) => {
      if (idAgendamento) {
        const agendamento = await tx.agendamento.findUnique({
          where: { id_agendamento: idAgendamento },
          select: {
            id_agendamento: true,
            status_agendamento: true,
            recebimentos: { select: { id_recebimento: true }, take: 1 },
          },
        });
        if (!agendamento) throw new Error("Agendamento não encontrado.");
        if (agendamento.recebimentos.length > 0) {
          throw new Error(
            "Não é possível registrar não recebimento para um agendamento já recebido.",
          );
        }

        const existente = await tx.naoRecebimento.findFirst({
          where: { id_agendamento: idAgendamento },
          select: { id: true },
        });
        if (existente) {
          throw new Error(
            "Este agendamento já possui um não recebimento registrado.",
          );
        }
      }

      return tx.naoRecebimento.create({
        data: {
          id_agendamento: idAgendamento ?? null,
          motivo_padronizado: motivo,
          observacao: observacao || null,
        },
        include: NAO_RECEBIMENTO_INCLUDE,
      });
    });
  }

  static async list(
    prisma: PrismaClient,
    filters: {
      dataInicio?: unknown;
      dataFim?: unknown;
      motivo?: unknown;
      idAgendamento?: unknown;
    },
  ) {
    const dataInicio = text(filters.dataInicio);
    const dataFim = text(filters.dataFim);
    const motivo = filters.motivo === undefined
      ? undefined
      : parseMotivo(filters.motivo);
    const idAgendamento = parseId(filters.idAgendamento);

    if ((dataInicio && !/^\d{4}-\d{2}-\d{2}$/.test(dataInicio)) ||
        (dataFim && !/^\d{4}-\d{2}-\d{2}$/.test(dataFim))) {
      throw new Error("data_inicio e data_fim devem estar no formato YYYY-MM-DD.");
    }
    if (dataInicio && dataFim && dataInicio > dataFim) {
      throw new Error("data_inicio não pode ser posterior a data_fim.");
    }

    const dataAgendada = dataInicio || dataFim
      ? {
          ...(dataInicio ? { gte: new Date(`${dataInicio}T00:00:00-03:00`) } : {}),
          ...(dataFim
            ? {
                lt: new Date(
                  new Date(`${dataFim}T00:00:00-03:00`).getTime() +
                    24 * 60 * 60 * 1000,
                ),
              }
            : {}),
        }
      : undefined;

    return prisma.naoRecebimento.findMany({
      where: {
        ...(motivo ? { motivo_padronizado: motivo } : {}),
        ...(idAgendamento ? { id_agendamento: idAgendamento } : {}),
        ...(dataAgendada ? { agendamento: { data_agendada: dataAgendada } } : {}),
      },
      include: NAO_RECEBIMENTO_INCLUDE,
      orderBy: { id: "desc" },
    });
  }

  static async getById(prisma: PrismaClient, id: number) {
    return prisma.naoRecebimento.findUnique({
      where: { id },
      include: NAO_RECEBIMENTO_INCLUDE,
    });
  }
}
