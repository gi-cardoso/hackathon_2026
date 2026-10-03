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

export { agendamentoRouter };
