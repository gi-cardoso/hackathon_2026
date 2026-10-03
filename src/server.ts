import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando com sucesso em http://localhost:${PORT}`);
  console.log(`🩺 Health check disponível em http://localhost:${PORT}/api/health`);
  console.log(`👤 CRUD de Usuários em http://localhost:${PORT}/api/users`);
});

// Graceful shutdown
const handleShutdown = async (signal: string) => {
  console.log(`\nRecebido sinal ${signal}. Encerrando aplicação graciosamente...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Conexão com Prisma encerrada.");
    process.exit(0);
  });
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
