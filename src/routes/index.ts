import { Router } from "express";
import { userRouter } from "./user.routes";
import { authRouter } from "./auth.routes";
import { invoiceRouter } from "./invoice.routes";
import { agendamentoRouter } from "./agendamento.routes";
import { fornecedorRouter } from "./fornecedor.routes";

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

export { router };
