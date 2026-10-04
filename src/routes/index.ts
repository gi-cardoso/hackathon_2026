import { Router } from "express";
import { userRouter } from "./user.routes";
import { authRouter } from "./auth.routes";
import { invoiceRouter } from "./invoice.routes";
import { agendamentoRouter } from "./agendamento.routes";
import { fornecedorRouter } from "./fornecedor.routes";
import { recebimentoRouter } from "../operacao/recebimento.routes";
import { dashboardRouter } from "../dashboard/dashboard.routes";
import { naoRecebimentoRouter } from "../operacao/nao-recebimento.routes";
import { operacaoCatalogoRouter } from "../operacao/catalogo.routes";
import { chapaRouter } from "./chapa.routes";

const router = Router();

// Health check route
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Auth routes
router.use("/auth", authRouter);

// User routes
router.use("/users", userRouter);

// Invoice parser routes
router.use("/invoices", invoiceRouter);
router.use("/agendamentos", agendamentoRouter);
router.use("/fornecedores", fornecedorRouter);
router.use("/recebimentos", recebimentoRouter);
router.use("/dashboard", dashboardRouter);
router.use("/nao-recebimentos", naoRecebimentoRouter);
router.use("/chapas", chapaRouter);
router.use("/", operacaoCatalogoRouter);

export { router };
