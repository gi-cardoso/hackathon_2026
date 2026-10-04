import { Router } from "express";
import { criarBoletim } from "./boletim.service";
import { prisma } from "../lib/prisma";
import { validarBoletim } from "./boletim.validacao";

export const boletimRouter = Router();

function parseIdPositivo(valor: unknown): number | undefined {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : undefined;
}

/**
 * Resolve o armazém do boletim sem depender de ID fixo:
 * 1. id_armazem/idArmazem enviado no corpo da requisição;
 * 2. variável de ambiente BOLETIM_ARMAZEM_ID (se existir no banco);
 * 3. primeiro armazém ativo (menor ID).
 */
async function resolverArmazemBoletim(body: Record<string, unknown>): Promise<number> {
  const idInformado = parseIdPositivo(body?.id_armazem ?? body?.idArmazem);
  if (idInformado) return idInformado;

  const idEnv = parseIdPositivo(process.env.BOLETIM_ARMAZEM_ID);
  if (idEnv) {
    const armazemEnv = await prisma.armazem.findUnique({
      where: { id_armazem: idEnv },
      select: { id_armazem: true },
    });
    if (armazemEnv) return armazemEnv.id_armazem;
  }

  const primeiroAtivo = await prisma.armazem.findFirst({
    where: { ativo: true },
    orderBy: { id_armazem: "asc" },
    select: { id_armazem: true },
  });

  if (!primeiroAtivo) {
    throw new Error("Nenhum armazém ativo cadastrado para vincular o boletim.");
  }

  return primeiroAtivo.id_armazem;
}

boletimRouter.post("/", async (req, res) => {
  try {
    const idArmazem = await resolverArmazemBoletim(req.body ?? {});

    const dadosValidados = validarBoletim({
      ...req.body,
      idArmazem,
    });

    const resultado = await criarBoletim({
      idArmazem,
      data: dadosValidados.dataConvertida,
      responsavelId: dadosValidados.responsavelId,
      producao: dadosValidados.producao,
      equipe: dadosValidados.equipe,
    });

    return res.status(201).json({
      mensagem: "Boletim criado com sucesso.",
      boletim: resultado.boletim,
      calculo: resultado.calculo,
    });
  } catch (erro) {
    if (erro instanceof Error) {
      return res.status(400).json({
        erro: erro.message,
      });
    }

    return res.status(500).json({
      erro: "Erro interno ao criar boletim.",
    });
  }
});

boletimRouter.get("/", async (req, res) => {
  try {
    const idArmazemFiltro = parseIdPositivo(req.query.id_armazem);

    const boletins = await prisma.boletimDiario.findMany({
      where: idArmazemFiltro ? { id_armazem: idArmazemFiltro } : undefined,
      include: {
        armazem: true,
        itens: true,
        equipes: true,
      },
      orderBy: {
        data: "desc",
      },
    });

    return res.json(boletins);
  } catch (erro) {
    return res.status(500).json({
      erro: "Erro ao buscar boletins.",
    });
  }
});

boletimRouter.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID do boletim inválido.",
      });
    }

    const boletim = await prisma.boletimDiario.findFirst({
      where: {
        id_boletim: id,
      },
      include: {
        armazem: true,
        itens: true,
        equipes: true,
      },
    });

    if (!boletim) {
      return res.status(404).json({
        erro: "Boletim não encontrado.",
      });
    }

    return res.json(boletim);
  } catch (erro) {
    return res.status(500).json({
      erro: "Erro ao buscar boletim.",
    });
  }
});