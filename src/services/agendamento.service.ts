import { Prisma, PrismaClient } from "@prisma/client";

const ACTIVE_STATUSES = ["PENDENTE", "APROVADO"];
const VALID_SLOTS = new Set(["08:00", "10:00", "13:00", "15:00"]);

export interface CreateAgendamentoInput {
  id_fornecedor?: number;
  id_nota?: number;
  numero_pedido_compra?: string;
  data_agendada: string;
  horario_agendado: string;
  tipo_acondicionamento: string;
  peso_total: number;
  itens?: Array<{
    codigo_item_cocapec: string;
    descricao_item: string;
    quantidade: number;
    codigo_deposito?: string;
  }>;
}

export class AgendamentoService {
  static async create(
    prisma: PrismaClient,
    input: CreateAgendamentoInput,
  ) {
    const data = this.parseDate(input.data_agendada);
    const horario = this.normalizeTime(input.horario_agendado);
    const tipo = this.normalizeType(input.tipo_acondicionamento);
    const peso = Number(input.peso_total);

    if (!data || data.getDay() === 0 || data.getDay() === 6) {
      throw new Error("A data do agendamento deve ser de segunda a sexta-feira.");
    }
    if (!VALID_SLOTS.has(horario)) {
      throw new Error("Horário inválido. Use 08:00, 10:00, 13:00 ou 15:00.");
    }
    if (!Number.isFinite(peso) || peso < 0) {
      throw new Error("O peso total deve ser um número maior ou igual a zero.");
    }
    if (!["BATIDO", "PALETIZADO", "BIG_BAG"].includes(tipo)) {
      throw new Error("Tipo de acondicionamento inválido.");
    }

    const previsao = this.calculateChapas(peso, tipo);

    return prisma.$transaction(async (tx) => {
      const existentes = await tx.agendamento.findMany({
        where: {
          data_agendada: data,
          horario_agendado: horario,
          status_agendamento: { in: ACTIVE_STATUSES },
        },
        select: { tipo_acondicionamento: true },
      });

      const temBatido = existentes.some(
        (item) => this.normalizeType(item.tipo_acondicionamento) === "BATIDO",
      );
      if (temBatido || (tipo === "BATIDO" && existentes.length > 0)) {
        throw new Error("Horário lotado: cargas BATIDO ocupam o horário sozinhas.");
      }
      if (tipo !== "BATIDO" && existentes.length >= 2) {
        throw new Error("Horário lotado: já existem dois caminhões agendados.");
      }

      return tx.agendamento.create({
        data: {
          id_fornecedor: input.id_fornecedor,
          id_nota: input.id_nota,
          numero_pedido_compra: input.numero_pedido_compra,
          data_agendada: data,
          horario_agendado: horario,
          tipo_acondicionamento: tipo,
          status_agendamento: "PENDENTE",
          qtd_chapas_prevista: previsao.quantidade,
          regra_chapas_aplicada: previsao.regra,
          cargas: {
            create: {
              peso_total: new Prisma.Decimal(peso),
              tipo_acondicionamento: tipo,
              itens: input.itens
                ? { create: input.itens.map((item) => ({
                    codigo_item_cocapec: item.codigo_item_cocapec,
                    descricao_item: item.descricao_item,
                    quantidade: new Prisma.Decimal(item.quantidade),
                    codigo_deposito: item.codigo_deposito,
                  })) }
                : undefined,
            },
          },
          validacoes: {
            create: {
              tipo_validacao: "COMPRAS",
              status: "PENDENTE",
            },
          },
        },
        include: { cargas: { include: { itens: true } }, validacoes: true },
      });
    });
  }

  static calculateChapas(peso: number, tipo: string) {
    if (peso < 500) {
      return { quantidade: 0, regra: "PESO_INFERIOR_500KG" };
    }
    if (tipo === "BATIDO") {
      return { quantidade: 5, regra: "BATIDO_5_CHAPAS" };
    }
    if (tipo === "PALETIZADO") {
      return { quantidade: 2, regra: "PALETIZADO_2_CHAPAS" };
    }
    return { quantidade: 2, regra: "BIG_BAG_2_CHAPAS" };
  }

  private static normalizeType(value: string): string {
    return value.trim().toUpperCase().replace(/[\s-]+/g, "_");
  }

  private static normalizeTime(value: string): string {
    const trimmed = value.trim();
    return /^\d{2}$/.test(trimmed) ? `${trimmed}:00` : trimmed;
  }

  private static parseDate(value: string): Date | undefined {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
}
