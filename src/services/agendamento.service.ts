import { Prisma, PrismaClient } from "@prisma/client";

const ACTIVE_STATUSES = [
  "PENDENTE",
  "APROVADO",
  "REAGENDADO",
];

const VALID_SLOTS = new Set([
  "08:00",
  "10:00",
  "13:00",
  "15:00",
]);

const ANALISE_INCLUDE = {
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
      destinos: {
        include: {
          armazem: true,
        },
      },
    },
  },

  validacoes: {
    include: {
      responsavel: {
        select: {
          id_usuario: true,
          nome: true,
          matricula: true,
          email: true,
          ativo: true,
          role: true,
        },
      },
    },
  },

  recebimentos: {
    include: {
      descargas: {
        include: {
          armazem: true,

          chapas: {
            include: {
              chapa: true,
            },
          },

          equipamentos: {
            include: {
              equipamento: true,
            },
          },
        },
      },
    },
  },

  nao_recebimentos: true,
} satisfies Prisma.AgendamentoInclude;

export type AgendamentoParaAnalise =
  Prisma.AgendamentoGetPayload<{
    include: typeof ANALISE_INCLUDE;
  }>;

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

export interface CancelarAgendamentoInput {
  motivo?: string;
}

export interface ReagendarAgendamentoInput {
  nova_data: string;
  novo_horario: string;
  motivo: string;
}

export type DecisaoAgendamento =
  | "APROVADO"
  | "REJEITADO";

export type TipoAcondicionamento =
  | "BATIDO"
  | "PALETIZADO"
  | "BIG_BAG";

export interface DisponibilidadeAgendamento {
  data: string;

  horarios: Array<{
    horario: string;
    disponivel: boolean;
    vagas_restantes: number;
    quantidade_agendamentos: number;
    tipos_disponiveis: TipoAcondicionamento[];
  }>;
}

export class AgendamentoService {
  // =========================================================
  // CRIAR AGENDAMENTO
  // =========================================================

  static async create(
    prisma: PrismaClient,
    input: CreateAgendamentoInput,
  ) {
    const data = this.parseDate(
      input.data_agendada
    );

    const horario = this.normalizeTime(
      input.horario_agendado
    );

    const tipo = this.normalizeType(
      input.tipo_acondicionamento
    );

    const peso = Number(input.peso_total);

    if (
      !data ||
      data.getDay() === 0 ||
      data.getDay() === 6
    ) {
      throw new Error(
        "A data do agendamento deve ser de segunda a sexta-feira."
      );
    }

    if (!VALID_SLOTS.has(horario)) {
      throw new Error(
        "Horário inválido. Use 08:00, 10:00, 13:00 ou 15:00."
      );
    }

    if (!Number.isFinite(peso) || peso < 0) {
      throw new Error(
        "O peso total deve ser um número maior ou igual a zero."
      );
    }

    if (
      ![
        "BATIDO",
        "PALETIZADO",
        "BIG_BAG",
      ].includes(tipo)
    ) {
      throw new Error(
        "Tipo de acondicionamento inválido."
      );
    }

    const previsao =
      this.calculateChapas(peso, tipo);

    return prisma.$transaction(
      async (tx) => {
        const existentes =
          await tx.agendamento.findMany({
            where: {
              data_agendada: data,
              horario_agendado: horario,

              status_agendamento: {
                in: ACTIVE_STATUSES,
              },
            },

            select: {
              tipo_acondicionamento: true,
            },
          });

        const temBatido =
          existentes.some(
            (item) =>
              this.normalizeType(
                item.tipo_acondicionamento
              ) === "BATIDO"
          );

        if (
          temBatido ||
          (tipo === "BATIDO" &&
            existentes.length > 0)
        ) {
          throw new Error(
            "Horário lotado: cargas BATIDO ocupam o horário sozinhas."
          );
        }

        if (
          tipo !== "BATIDO" &&
          existentes.length >= 2
        ) {
          throw new Error(
            "Horário lotado: já existem dois caminhões agendados."
          );
        }

        return tx.agendamento.create({
          data: {
            id_fornecedor:
              input.id_fornecedor,

            id_nota:
              input.id_nota,

            numero_pedido_compra:
              input.numero_pedido_compra,

            data_agendada:
              data,

            horario_agendado:
              horario,

            tipo_acondicionamento:
              tipo,

            status_agendamento:
              "PENDENTE",

            qtd_chapas_prevista:
              previsao.quantidade,

            regra_chapas_aplicada:
              previsao.regra,

            cargas: {
              create: {
                peso_total:
                  new Prisma.Decimal(peso),

                tipo_acondicionamento:
                  tipo,

                itens: input.itens
                  ? {
                      create:
                        input.itens.map(
                          (item) => ({
                            codigo_item_cocapec:
                              item.codigo_item_cocapec,

                            descricao_item:
                              item.descricao_item,

                            quantidade:
                              new Prisma.Decimal(
                                item.quantidade
                              ),

                            codigo_deposito:
                              item.codigo_deposito,
                          })
                        ),
                    }
                  : undefined,
              },
            },

            validacoes: {
              create: {
                tipo_validacao:
                  "COMPRAS",

                status:
                  "PENDENTE",
              },
            },
          },

          include: {
            cargas: {
              include: {
                itens: true,
              },
            },

            validacoes: true,
          },
        });
      }
    );
  }

  // =========================================================
  // CÁLCULO DE CHAPAS PREVISTOS
  // =========================================================

  static calculateChapas(
    peso: number,
    tipo: string
  ) {
    if (peso < 500) {
      return {
        quantidade: 0,
        regra: "PESO_INFERIOR_500KG",
      };
    }

    if (tipo === "BATIDO") {
      return {
        quantidade: 5,
        regra: "BATIDO_5_CHAPAS",
      };
    }

    if (tipo === "PALETIZADO") {
      return {
        quantidade: 2,
        regra: "PALETIZADO_2_CHAPAS",
      };
    }

    return {
      quantidade: 2,
      regra: "BIG_BAG_2_CHAPAS",
    };
  }

  // =========================================================
  // CONSULTAR DISPONIBILIDADE
  // =========================================================

  static async availability(
    prisma: PrismaClient,
    dataAgendada: string,
    tipoInput?: string,
  ): Promise<DisponibilidadeAgendamento> {
    const data =
      this.parseDate(dataAgendada);

    if (
      !data ||
      data.getDay() === 0 ||
      data.getDay() === 6
    ) {
      throw new Error(
        "A data do agendamento deve ser de segunda a sexta-feira."
      );
    }

    const tipo = tipoInput
      ? this.normalizeType(tipoInput)
      : undefined;

    if (
      tipo &&
      ![
        "BATIDO",
        "PALETIZADO",
        "BIG_BAG",
      ].includes(tipo)
    ) {
      throw new Error(
        "Tipo de acondicionamento inválido."
      );
    }

    const agendamentos =
      await prisma.agendamento.findMany({
        where: {
          data_agendada: data,

          status_agendamento: {
            in: ACTIVE_STATUSES,
          },
        },

        select: {
          horario_agendado: true,
          tipo_acondicionamento: true,
        },
      });

    const horarios =
      [...VALID_SLOTS].sort();

    return {
      data: dataAgendada,

      horarios: horarios.map(
        (horario) => {
          const existentes =
            agendamentos.filter(
              (item) =>
                this.normalizeTime(
                  item.horario_agendado
                ) === horario
            );

          const temBatido =
            existentes.some(
              (item) =>
                this.normalizeType(
                  item.tipo_acondicionamento
                ) === "BATIDO"
            );

          const tiposDisponiveis:
            TipoAcondicionamento[] = [];

          if (
            !temBatido &&
            existentes.length === 0
          ) {
            tiposDisponiveis.push(
              "BATIDO",
              "PALETIZADO",
              "BIG_BAG"
            );
          } else if (
            !temBatido &&
            existentes.length < 2
          ) {
            tiposDisponiveis.push(
              "PALETIZADO",
              "BIG_BAG"
            );
          }

          const disponivel =
            tipo
              ? tiposDisponiveis.includes(
                  tipo as TipoAcondicionamento
                )
              : tiposDisponiveis.length > 0;

          return {
            horario,
            disponivel,

            vagas_restantes:
              tipo === "BATIDO"
                ? temBatido ||
                  existentes.length > 0
                  ? 0
                  : 1
                : temBatido
                  ? 0
                  : Math.max(
                      0,
                      2 -
                        existentes.length
                    ),

            quantidade_agendamentos:
              existentes.length,

            tipos_disponiveis:
              tiposDisponiveis,
          };
        }
      ),
    };
  }

  // =========================================================
  // LISTAGEM PARA COMPRAS
  // =========================================================

  static async listForPurchasing(
    prisma: PrismaClient
  ) {
    return prisma.agendamento.findMany({
      where: {
        validacoes: {
          some: {
            tipo_validacao: "COMPRAS",
          },
        },
      },

      include:
        ANALISE_INCLUDE,

      orderBy: [
        {
          data_agendada:
            "asc",
        },
        {
          horario_agendado:
            "asc",
        },
      ],
    });
  }

  // =========================================================
  // BUSCAR AGENDAMENTO PARA COMPRAS
  // =========================================================

  static async getForPurchasing(
    prisma: PrismaClient,
    id: number
  ) {
    return prisma.agendamento.findUnique({
      where: {
        id_agendamento: id,
      },

      include:
        ANALISE_INCLUDE,
    });
  }

  // =========================================================
  // LISTAR AGENDAMENTOS DO FORNECEDOR
  // =========================================================

  static async listByFornecedor(
    prisma: PrismaClient,
    idFornecedor: number
  ) {
    return prisma.agendamento.findMany({
      where: {
        id_fornecedor:
          idFornecedor,
      },

      include:
        ANALISE_INCLUDE,

      orderBy: [
        {
          data_agendada:
            "desc",
        },
        {
          horario_agendado:
            "desc",
        },
        {
          id_agendamento:
            "desc",
        },
      ],
    });
  }

  // =========================================================
  // CANCELAR AGENDAMENTO
  // =========================================================

  static async cancelar(
    prisma: PrismaClient,
    id: number,
    idFornecedor: number,
    input: CancelarAgendamentoInput,
  ) {
    const agendamento =
      await prisma.agendamento.findUnique({
        where: {
          id_agendamento: id,
        },
      });

    if (!agendamento) {
      throw new Error(
        "Agendamento não encontrado."
      );
    }

    if (
      agendamento.id_fornecedor !==
      idFornecedor
    ) {
      throw new Error(
        "Você não pode cancelar este agendamento."
      );
    }

    if (
      agendamento.status_agendamento ===
      "CANCELADO"
    ) {
      throw new Error(
        "Este agendamento já foi cancelado."
      );
    }

    if (
      agendamento.status_agendamento ===
      "CONCLUIDO"
    ) {
      throw new Error(
        "Não é possível cancelar um agendamento concluído."
      );
    }

    return prisma.agendamento.update({
      where: {
        id_agendamento: id,
      },

      data: {
        status_agendamento:
          "CANCELADO",

        motivo_cancelamento:
          input.motivo?.trim() ||
          null,
      },

      include:
        ANALISE_INCLUDE,
    });
  }

  // =========================================================
  // REAGENDAR AGENDAMENTO
  // =========================================================

  static async reagendar(
    prisma: PrismaClient,
    id: number,
    idFornecedor: number,
    input: ReagendarAgendamentoInput,
  ) {
    const novaData =
      this.parseDate(
        input.nova_data
      );

    const novoHorario =
      this.normalizeTime(
        input.novo_horario
      );

    if (
      !novaData ||
      novaData.getDay() === 0 ||
      novaData.getDay() === 6
    ) {
      throw new Error(
        "A nova data deve ser de segunda a sexta-feira."
      );
    }

    if (
      !VALID_SLOTS.has(
        novoHorario
      )
    ) {
      throw new Error(
        "Horário inválido. Use 08:00, 10:00, 13:00 ou 15:00."
      );
    }

    if (!input.motivo?.trim()) {
      throw new Error(
        "O motivo do reagendamento é obrigatório."
      );
    }

    return prisma.$transaction(
      async (tx) => {
        const agendamento =
          await tx.agendamento.findUnique({
            where: {
              id_agendamento:
                id,
            },
          });

        if (!agendamento) {
          throw new Error(
            "Agendamento não encontrado."
          );
        }

        if (
          agendamento.id_fornecedor !==
          idFornecedor
        ) {
          throw new Error(
            "Você não pode reagendar este agendamento."
          );
        }

        if (
          agendamento.status_agendamento ===
          "CANCELADO"
        ) {
          throw new Error(
            "Não é possível reagendar um agendamento cancelado."
          );
        }

        if (
          agendamento.status_agendamento ===
          "CONCLUIDO"
        ) {
          throw new Error(
            "Não é possível reagendar um agendamento concluído."
          );
        }

        const existentes =
          await tx.agendamento.findMany({
            where: {
              data_agendada:
                novaData,

              horario_agendado:
                novoHorario,

              status_agendamento: {
                in: ACTIVE_STATUSES,
              },

              // Não contar o próprio
              // agendamento na nova vaga.
              id_agendamento: {
                not: id,
              },
            },

            select: {
              tipo_acondicionamento:
                true,
            },
          });

        const tipo =
          this.normalizeType(
            agendamento.tipo_acondicionamento
          );

        const temBatido =
          existentes.some(
            (item) =>
              this.normalizeType(
                item.tipo_acondicionamento
              ) === "BATIDO"
          );

        if (
          temBatido ||
          (tipo === "BATIDO" &&
            existentes.length > 0)
        ) {
          throw new Error(
            "Horário lotado: cargas BATIDO ocupam o horário sozinhas."
          );
        }

        if (
          tipo !== "BATIDO" &&
          existentes.length >= 2
        ) {
          throw new Error(
            "Horário lotado: já existem dois caminhões agendados."
          );
        }

        return tx.agendamento.update({
          where: {
            id_agendamento:
              id,
          },

          data: {
            data_agendada:
              novaData,

            horario_agendado:
              novoHorario,

            status_agendamento:
              "REAGENDADO",

            motivo_reagendamento:
              input.motivo.trim(),

            validacoes: {
              updateMany: {
                where: {
                  tipo_validacao: "COMPRAS",
                },
                data: {
                  status: "PENDENTE",
                },
              },
            },
          },

          include:
            ANALISE_INCLUDE,
        });
      }
    );
  }

  // =========================================================
  // DECISÃO DO SETOR DE COMPRAS
  // =========================================================

  static async decide(
    prisma: PrismaClient,
    id: number,
    responsavelId: number,
    decisao: DecisaoAgendamento,
  ) {
    return prisma.$transaction(
      async (tx) => {
        const agendamento =
          await tx.agendamento.findUnique({
            where: {
              id_agendamento:
                id,
            },

            include: {
              validacoes: {
                where: {
                  tipo_validacao:
                    "COMPRAS",
                },

                orderBy: {
                  id_validacao:
                    "desc",
                },

                take: 1,
              },
            },
          });

        if (!agendamento) {
          throw new Error(
            "Agendamento não encontrado."
          );
        }

        const validacao =
          agendamento.validacoes[0];

        if (
          (agendamento.status_agendamento !== "PENDENTE" &&
            agendamento.status_agendamento !== "REAGENDADO") ||
          !validacao ||
          validacao.status !== "PENDENTE"
        ) {
          throw new Error(
            "Este agendamento já foi analisado."
          );
        }

        await tx.validacao.update({
          where: {
            id_validacao:
              validacao.id_validacao,
          },

          data: {
            status:
              decisao,

            responsavel_id:
              responsavelId,
          },
        });

        await tx.agendamento.update({
          where: {
            id_agendamento:
              id,
          },

          data: {
            status_agendamento:
              decisao,
          },
        });

        return tx.agendamento.findUniqueOrThrow({
          where: {
            id_agendamento:
              id,
          },

          include:
            ANALISE_INCLUDE,
        });
      }
    );
  }

  // =========================================================
  // MÉTODOS PRIVADOS
  // =========================================================

  private static normalizeType(
    value: string
  ): string {
    return value
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");
  }

  private static normalizeTime(
    value: string
  ): string {
    const trimmed =
      value.trim();

    return /^\d{2}$/.test(
      trimmed
    )
      ? `${trimmed}:00`
      : trimmed;
  }

  private static parseDate(
    value: string
  ): Date | undefined {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        value
      )
    ) {
      return undefined;
    }

    const date =
      new Date(
        `${value}T00:00:00`
      );

    return Number.isNaN(
      date.getTime()
    )
      ? undefined
      : date;
  }
}