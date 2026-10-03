import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  AgendamentoService,
  CreateAgendamentoInput,
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
}
