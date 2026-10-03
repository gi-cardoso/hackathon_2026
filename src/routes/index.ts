import { Router } from "express";
import { userRouter } from "./user.routes";
import { authRouter } from "./auth.routes";
import { invoiceRouter } from "./invoice.routes";

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

export { router };
