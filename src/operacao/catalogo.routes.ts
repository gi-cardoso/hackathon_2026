import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export const operacaoCatalogoRouter = Router();

operacaoCatalogoRouter.use(
  AuthMiddleware.verifyToken,
  AuthMiddleware.hasRole(["ARMAZEM", "COMPRAS", "ADMIN"]),
);

operacaoCatalogoRouter.get("/armazens", async (_req, res) => {
  try {
    const armazens = await prisma.armazem.findMany({
      where: { ativo: true },
      select: {
        id_armazem: true,
        nome_armazem: true,
        codigo_deposito: true,
        grupo: true,
      },
      orderBy: { nome_armazem: "asc" },
    });
    return res.json(armazens);
  } catch (error) {
    console.error("Erro ao listar armazéns:", error);
    return res.status(500).json({ error: "Erro ao listar armazéns." });
  }
});

operacaoCatalogoRouter.get("/equipamentos", async (_req, res) => {
  try {
    const equipamentos = await prisma.equipamento.findMany({
      where: { ativo: true },
      select: {
        id_tipo_equipamento: true,
        nome: true,
        armazem_base: true,
        quantidade_disponivel: true,
      },
      orderBy: { nome: "asc" },
    });
    return res.json(equipamentos);
  } catch (error) {
    console.error("Erro ao listar equipamentos:", error);
    return res.status(500).json({ error: "Erro ao listar equipamentos." });
  }
});

operacaoCatalogoRouter.get("/agendamentos", async (req, res) => {
  const statusQuery = String(req.query.status ?? "").trim().toUpperCase();
  const status = statusQuery
    ? statusQuery.split(",").map((item) => item.trim()).filter(Boolean)
    : ["APROVADO", "PENDENTE"];
  const statusPermitidos = new Set(["APROVADO", "PENDENTE"]);

  if (
    status.length === 0 ||
    status.some((item) => !statusPermitidos.has(item))
  ) {
    return res.status(400).json({
      error: "status inválido. Use APROVADO, PENDENTE ou uma lista separada por vírgulas.",
    });
  }

  try {
    const agendamentos = await prisma.agendamento.findMany({
      where: { status_agendamento: { in: status } },
      select: {
        id_agendamento: true,
        id_fornecedor: true,
        id_nota: true,
        numero_pedido_compra: true,
        data_agendada: true,
        horario_agendado: true,
        tipo_acondicionamento: true,
        status_agendamento: true,
        qtd_chapas_prevista: true,
        regra_chapas_aplicada: true,
        fornecedor: {
          select: {
            id_fornecedor: true,
            codigo_fornecedor_cocapec: true,
            nome_fornecedor: true,
            cnpj: true,
            contato: true,
          },
        },
        nota_fiscal: true,
        cargas: {
          select: {
            id_carga: true,
            peso_total: true,
            tipo_acondicionamento: true,
            itens: true,
            destinos: {
              select: {
                id_armazem: true,
                armazem: {
                  select: {
                    id_armazem: true,
                    nome_armazem: true,
                    codigo_deposito: true,
                    grupo: true,
                  },
                },
              },
            },
          },
        },
        recebimentos: {
          select: { id_recebimento: true, status_recebimento: true },
        },
        nao_recebimentos: {
          select: { id: true, motivo_padronizado: true, observacao: true },
        },
      },
      orderBy: [
        { data_agendada: "asc" },
        { horario_agendado: "asc" },
        { id_agendamento: "asc" },
      ],
    });
    return res.json(agendamentos);
  } catch (error) {
    console.error("Erro ao listar agendamentos para operação:", error);
    return res.status(500).json({ error: "Erro ao listar agendamentos." });
  }
});
