import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { router } from "./routes";
import { boletimRouter } from "./boletim/boletim.routes";

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use("/api/boletins", boletimRouter);

// Routes
app.use("/api", router);

// Root route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Bem-vindo à API Express + TypeScript + Prisma!",
    docs: "/api/health",
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Rota não encontrada",
  });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error("Unhandled Error:", err);

    res.status(500).json({
      error: "Erro interno no servidor",
    });
  }
);

export { app };