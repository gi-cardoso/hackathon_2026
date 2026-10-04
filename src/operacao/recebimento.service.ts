import { Prisma, PrismaClient } from "@prisma/client";

const RECEBIMENTO_INCLUDE = {
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
      cargas: { include: { itens: true } },
    },
  },
  descargas: {
    select: {
      id_descarga: true,
      id_recebimento: true,
      id_armazem: true,
      qtd_chapas_utilizados: true,
      armazem: true,
      equipamentos: { include: { equipamento: true } },
    },
  },
} satisfies Prisma.RecebimentoInclude;

export interface DescargaOperacaoInput {
  id_armazem: number;
  qtd_chapas_utilizados: number;
  equipamentos: Array<{
    id_tipo_equipamento: number;
    quantidade_utilizada: number;
  }>;
}

export interface RegistrarOperacaoInput extends DescargaOperacaoInput {
  id_agendamento: number;
  hora_chegada: unknown;
  hora_entrada: unknown;
  hora_saida: unknown;
}

function parseMoment(value: unknown, field: string): Date | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${field} inválida.`);
  }
  return date;
}

export class RecebimentoService {
  static async registrarOperacao(
    prisma: PrismaClient,
    input: RegistrarOperacaoInput,
  ) {
    const horaChegada = parseMoment(input.hora_chegada, "hora_chegada");
    const horaEntrada = parseMoment(input.hora_entrada, "hora_entrada");
    const horaSaida = parseMoment(input.hora_saida, "hora_saida");

    if (!horaChegada || !horaEntrada || !horaSaida) {
      throw new Error(
        "hora_chegada, hora_entrada e hora_saida são obrigatórias.",
      );
    }
    if (horaEntrada < horaChegada) {
      throw new Error("A hora de entrada não pode ser anterior à chegada.");
    }
    if (horaSaida < horaEntrada) {
      throw new Error("A hora de saída não pode ser anterior à entrada.");
    }
    if (!Number.isInteger(input.id_agendamento) || input.id_agendamento <= 0) {
      throw new Error("id_agendamento inválido.");
    }
    if (!Number.isInteger(input.id_armazem) || input.id_armazem <= 0) {
      throw new Error("id_armazem inválido.");
    }
    if (
      !Number.isInteger(input.qtd_chapas_utilizados) ||
      input.qtd_chapas_utilizados <= 0
    ) {
      throw new Error("qtd_chapas_utilizados deve ser um inteiro maior que zero.");
    }
    if (!Array.isArray(input.equipamentos)) {
      throw new Error("equipamentos deve ser uma lista.");
    }

    const equipamentoIds = input.equipamentos.map((item) => item.id_tipo_equipamento);
    if (new Set(equipamentoIds).size !== equipamentoIds.length) {
      throw new Error("Não repita o mesmo equipamento na descarga.");
    }
    if (input.equipamentos.some(
      (item) =>
        !Number.isInteger(item.id_tipo_equipamento) ||
        item.id_tipo_equipamento <= 0 ||
        !Number.isInteger(item.quantidade_utilizada) ||
        item.quantidade_utilizada <= 0,
    )) {
      throw new Error("Equipamentos e quantidades utilizadas são inválidos.");
    }

    return prisma.$transaction(async (tx) => {
      const agendamento = await tx.agendamento.findUnique({
        where: { id_agendamento: input.id_agendamento },
        select: { id_agendamento: true, status_agendamento: true },
      });
      if (!agendamento) throw new Error("Agendamento não encontrado.");
      if (agendamento.status_agendamento !== "APROVADO") {
        throw new Error("Somente agendamentos aprovados podem ser registrados.");
      }

      const recebimentoExistente = await tx.recebimento.findFirst({
        where: { id_agendamento: input.id_agendamento },
        select: { id_recebimento: true },
      });
      if (recebimentoExistente) {
        throw new Error("Este agendamento já possui uma operação registrada.");
      }

      const [armazem, equipamentos] = await Promise.all([
        tx.armazem.findUnique({
          where: { id_armazem: input.id_armazem },
          select: { id_armazem: true, ativo: true },
        }),
        tx.equipamento.findMany({
          where: { id_tipo_equipamento: { in: equipamentoIds } },
          select: { id_tipo_equipamento: true, ativo: true },
        }),
      ]);

      if (!armazem) throw new Error("Armazém não encontrado.");
      if (!armazem.ativo) throw new Error("Armazém inativo.");
      if (
        equipamentos.length !== equipamentoIds.length ||
        equipamentos.some((item) => !item.ativo)
      ) {
        throw new Error("Todos os equipamentos informados devem existir e estar ativos.");
      }

      const recebimento = await tx.recebimento.create({
        data: {
          id_agendamento: input.id_agendamento,
          hora_chegada: horaChegada,
          hora_entrada: horaEntrada,
          hora_saida: horaSaida,
          status_recebimento: "FINALIZADO",
          descargas: {
            create: {
              id_armazem: input.id_armazem,
              quantidade_movimentada: new Prisma.Decimal(0),
              qtd_chapas_utilizados: input.qtd_chapas_utilizados,
              equipamentos: {
                create: input.equipamentos.map((item) => ({
                  id_tipo_equipamento: item.id_tipo_equipamento,
                  quantidade_utilizada: item.quantidade_utilizada,
                })),
              },
            },
          },
        },
        include: RECEBIMENTO_INCLUDE,
      });

      return recebimento;
    });
  }

  static async getById(prisma: PrismaClient, id: number) {
    return prisma.recebimento.findUnique({
      where: { id_recebimento: id },
      include: RECEBIMENTO_INCLUDE,
    });
  }

}
