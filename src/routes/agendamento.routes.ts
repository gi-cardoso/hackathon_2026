import { Router } from "express";
import { AgendamentoController } from "../controllers/agendamento.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const agendamentoRouter = Router();

agendamentoRouter.post(
  "/",
  AuthMiddleware.verifyToken,
  AuthMiddleware.enforceFornecedorIdentity,
  AgendamentoController.create,
);

agendamentoRouter.get(
  "/disponibilidade",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isFornecedor,
  AgendamentoController.availability,
);

agendamentoRouter.get(
  "/me",
  AuthMiddleware.verifyToken,
  AuthMiddleware.enforceFornecedorIdentity,
  AuthMiddleware.isFornecedor,
  AgendamentoController.listMine,
);

agendamentoRouter.patch(
  "/:id/cancelar",
  AuthMiddleware.verifyToken,
  AuthMiddleware.enforceFornecedorIdentity,
  AuthMiddleware.isFornecedor,
  AgendamentoController.cancelar,
);

agendamentoRouter.patch(
  "/:id/reagendar",
  AuthMiddleware.verifyToken,
  AuthMiddleware.enforceFornecedorIdentity,
  AuthMiddleware.isFornecedor,
  AgendamentoController.reagendar,
);

agendamentoRouter.get(
  "/analise/compras",
  AuthMiddleware.verifyToken,
  AuthMiddleware.hasRole(["COMPRAS", "ADMIN"]),
  AgendamentoController.listForPurchasing,
);

agendamentoRouter.get(
  "/analise/compras/:id",
  AuthMiddleware.verifyToken,
  AuthMiddleware.hasRole(["COMPRAS", "ADMIN"]),
  AgendamentoController.getForPurchasing,
);

agendamentoRouter.patch(
  "/analise/compras/:id/decisao",
  AuthMiddleware.verifyToken,
  AuthMiddleware.hasRole(["COMPRAS", "ADMIN"]),
  AgendamentoController.decide,
);

export { agendamentoRouter };