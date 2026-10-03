import { Router } from "express";
import { criarBoletim } from "./boletim.service";
import { prisma } from "../lib/prisma";
import { validarBoletim } from "./boletim.validacao";

export const boletimRouter = Router();

boletimRouter.post("/", async (req, res) => {
  try {
    const dadosValidados = validarBoletim(req.body);

const resultado = await criarBoletim({
  idArmazem: dadosValidados.idArmazem,
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
    const boletins = await prisma.boletimDiario.findMany({
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

    const boletim = await prisma.boletimDiario.findUnique({
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