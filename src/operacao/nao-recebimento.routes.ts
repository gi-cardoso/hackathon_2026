import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import {
  MOTIVOS_NAO_RECEBIMENTO,
  NaoRecebimentoService,
} from "./nao-recebimento.service";

export const naoRecebimentoRouter = Router();

naoRecebimentoRouter.use(
  AuthMiddleware.verifyToken,
  AuthMiddleware.hasRole(["ARMAZEM", "ADMIN"]),
);

naoRecebimentoRouter.get("/motivos", (_req, res) => {
  return res.json({
    motivos: MOTIVOS_NAO_RECEBIMENTO,
    observacao_obrigatoria_para: ["OUTRO"],
  });
});

naoRecebimentoRouter.post("/", async (req, res) => {
  try {
    const naoRecebimento = await NaoRecebimentoService.create(prisma, req.body);
    return res.status(201).json(naoRecebimento);
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Erro ao registrar não recebimento.";
    const status = message === "Agendamento não encontrado." ? 404 : 400;
    return res.status(status).json({ error: message });
  }
});

naoRecebimentoRouter.get("/", async (req, res) => {
  try {
    const naoRecebimentos = await NaoRecebimentoService.list(prisma, {
      dataInicio: req.query.data_inicio,
      dataFim: req.query.data_fim,
      motivo: req.query.motivo,
      idAgendamento: req.query.id_agendamento,
    });
    return res.json(naoRecebimentos);
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Erro ao listar não recebimentos.";
    return res.status(400).json({ error: message });
  }
});

naoRecebimentoRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "ID do não recebimento inválido." });
  }

  try {
    const naoRecebimento = await NaoRecebimentoService.getById(prisma, id);
    if (!naoRecebimento) {
      return res.status(404).json({ error: "Não recebimento não encontrado." });
    }
    return res.json(naoRecebimento);
  } catch (error) {
    console.error("Erro ao buscar não recebimento:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});
