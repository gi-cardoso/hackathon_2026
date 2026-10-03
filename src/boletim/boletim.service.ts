import { prisma } from "../lib/prisma";

import {
  calcularBoletim,
  calcularDiariasEquivalentes,
  calcularItemBoletim,
  calcularTotalProducao,
  TipoJornada,
} from "./calculos";

import { TipoItemBoletim } from "./precos";

interface ItemProducao {
  tipoItem: TipoItemBoletim;
  descarga: number;
  remocao: number;
  transferencia: number;
}

interface MembroEquipe {
  matricula: string;
  jornada: TipoJornada;
}

interface CriarBoletimInput {
  idArmazem: number;
  data: Date;
  responsavelId?: number;
  producao: ItemProducao[];
  equipe: MembroEquipe[];
}

export async function criarBoletim(input: CriarBoletimInput) {
  // 1. Verifica se o armazém existe
  const armazem = await prisma.armazem.findUnique({
    where: {
      id_armazem: input.idArmazem,
    },
  });

  if (!armazem) {
    throw new Error("Armazém não encontrado.");
  }

  // 2. Verifica se todos os chapas existem
  const matriculasInformadas = input.equipe.map(
    (membro) => membro.matricula
  );

  const chapasEncontrados = await prisma.chapa.findMany({
    where: {
      matricula_chapa: {
        in: matriculasInformadas,
      },
    },
    select: {
      matricula_chapa: true,
    },
  });

  const matriculasEncontradas = new Set(
    chapasEncontrados.map(
      (chapa) => chapa.matricula_chapa
    )
  );

  const matriculasInvalidas = matriculasInformadas.filter(
    (matricula) => !matriculasEncontradas.has(matricula)
  );

  if (matriculasInvalidas.length > 0) {
    throw new Error(
      `Chapa(s) não encontrado(s): ${matriculasInvalidas.join(", ")}.`
    );
  }

  // 3. Verifica se já existe boletim
  const existente = await prisma.boletimDiario.findFirst({
    where: {
      id_armazem: input.idArmazem,
      data: input.data,
    },
  });

  if (existente) {
    throw new Error(
      "Já existe um boletim para este armazém nesta data."
    );
  }

  // 4. Calcula cada item da produção
  const itensCalculados = input.producao.map((item) =>
    calcularItemBoletim(
      item.tipoItem,
      item.descarga,
      item.remocao,
      item.transferencia
    )
  );

  // 5. Soma toda a produção
  const producaoTotal = calcularTotalProducao(
    itensCalculados.map((item) => item.valorProducao)
  );

  // 6. Calcula as diárias equivalentes
  const diariasEquivalentes = calcularDiariasEquivalentes(
    input.equipe.map((membro) => membro.jornada)
  );

  // 7. Aplica a regra do piso
  const resultado = calcularBoletim(
    producaoTotal,
    diariasEquivalentes
  );

  // 8. Salva tudo no banco
  const boletim = await prisma.boletimDiario.create({
    data: {
      id_armazem: input.idArmazem,
      data: input.data,
      responsavel_id: input.responsavelId ?? null,

      diarias_equivalentes_total:
        resultado.diariasEquivalentes.toFixed(1),

      valor_produzido_total:
        resultado.producaoTotal.toFixed(4),

      complemento_diaria_pago:
        resultado.complemento.toFixed(4),

      itens: {
        create: itensCalculados.map((item) => ({
          tipo_servico: item.tipoItem,
          qtd_descarga: item.descarga,
          qtd_remocao: item.remocao,
          qtd_transferencia: item.transferencia,
          quantidade: item.quantidadeTotal,
          preco_unitario: item.precoUnitario.toFixed(4),
          valor_producao: item.valorProducao.toFixed(4),
        })),
      },

      equipes: {
        create: input.equipe.map((membro) => ({
          matricula_chapa: membro.matricula,
          tipo_jornada: membro.jornada,
        })),
      },
    },

    include: {
      itens: true,
      equipes: true,
      armazem: true,
    },
  });

  return {
    boletim,
    calculo: resultado,
  };
}