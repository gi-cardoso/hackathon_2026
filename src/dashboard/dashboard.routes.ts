import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { DashboardService } from "./dashboard.service";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/operacao",
  AuthMiddleware.verifyToken,
  AuthMiddleware.hasRole(["ADMIN", "COMPRAS", "ARMAZEM"]),
  async (req, res) => {
    try {
      const data = await DashboardService.getOperationalData(prisma, {
        dataInicio: req.query.data_inicio,
        dataFim: req.query.data_fim,
        idArmazem: req.query.id_armazem,
      });
      return res.json(data);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Erro ao gerar dashboard operacional.";
      return res.status(400).json({ error: message });
    }
  },
);
