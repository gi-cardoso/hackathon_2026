import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import {
  RecebimentoService,
  RegistrarOperacaoInput,
} from "./recebimento.service";

export const recebimentoRouter = Router();

recebimentoRouter.use(
  AuthMiddleware.verifyToken,
  AuthMiddleware.hasRole(["ARMAZEM", "ADMIN"]),
);

recebimentoRouter.post("/", async (req, res) => {
  try {
    const payload = req.body as RegistrarOperacaoInput;
    const recebimento = await RecebimentoService.registrarOperacao(prisma, payload);
    return res.status(201).json(recebimento);
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Erro ao registrar operação do armazém.";
    return res.status(400).json({ error: message });
  }
});

recebimentoRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "ID do recebimento inválido." });
  }

  try {
    const recebimento = await RecebimentoService.getById(prisma, id);
    if (!recebimento) {
      return res.status(404).json({ error: "Recebimento não encontrado." });
    }
    return res.json(recebimento);
  } catch (error) {
    console.error("Erro ao buscar operação do armazém:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});
