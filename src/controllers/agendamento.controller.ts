import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  AgendamentoService,
  CreateAgendamentoInput,
  DecisaoAgendamento,
} from "../services/agendamento.service";

export class AgendamentoController {
  static async create(req: Request, res: Response) {
    try {
      const payload = req.body as CreateAgendamentoInput;
      const userId = req.currentFornecedorId;
      const idFornecedor = userId ?? Number(payload.id_fornecedor);

      if (!Number.isInteger(idFornecedor) || idFornecedor <= 0) {
        return res.status(400).json({ error: "id_fornecedor é obrigatório." });
      }

      const agendamento = await AgendamentoService.create(prisma, {
        ...payload,
        id_fornecedor: idFornecedor,
      });
      return res.status(201).json(agendamento);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar agendamento.";
      return res.status(400).json({ error: message });
    }
  }

  static async availability(req: Request, res: Response) {
    const data = String(req.query.data ?? "");
    const tipo = req.query.tipo_acondicionamento
      ? String(req.query.tipo_acondicionamento)
      : undefined;

    try {
      const disponibilidade = await AgendamentoService.availability(prisma, data, tipo);
      return res.json(disponibilidade);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Erro ao consultar disponibilidade.";
      return res.status(400).json({ error: message });
    }
  }

  static async listForPurchasing(req: Request, res: Response) {
    try {
      const agendamentos = await AgendamentoService.listForPurchasing(prisma);
      return res.json(agendamentos);
    } catch (error) {
      console.error("Erro ao listar agendamentos para compras:", error);
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  }

  static async getForPurchasing(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID do agendamento inválido." });
    }

    try {
      const agendamento = await AgendamentoService.getForPurchasing(prisma, id);
      if (!agendamento) {
        return res.status(404).json({ error: "Agendamento não encontrado." });
      }
      return res.json(agendamento);
    } catch (error) {
      console.error("Erro ao buscar agendamento para compras:", error);
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  }

  static async decide(req: Request, res: Response) {
    const id = Number(req.params.id);
    const responsavelId = req.user?.tipo === "INTERNO" ? req.user.sub : 0;
    const decisao = String(req.body?.decisao ?? "").trim().toUpperCase();

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID do agendamento inválido." });
    }
    if (!Number.isInteger(responsavelId) || responsavelId <= 0) {
      return res.status(401).json({ error: "Usuário interno não identificado." });
    }
    if (decisao !== "APROVADO" && decisao !== "REJEITADO") {
      return res.status(400).json({
        error: "Decisão inválida. Use APROVADO ou REJEITADO.",
      });
    }

    try {
      const agendamento = await AgendamentoService.decide(
        prisma,
        id,
        responsavelId,
        decisao as DecisaoAgendamento,
      );
      return res.json(agendamento);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao analisar agendamento.";
      const status =
        message === "Agendamento não encontrado."
          ? 404
          : message === "Este agendamento já foi analisado."
            ? 409
            : 400;
      return res.status(status).json({ error: message });
    }
  }
}
