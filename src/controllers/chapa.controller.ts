import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export class ChapaController {
  static async getAll(req: Request, res: Response) {
    try {
      const apenasAtivos = req.query.ativo !== "false";
      const chapas = await prisma.chapa.findMany({
        where: apenasAtivos ? { ativo: true } : undefined,
        select: {
          matricula_chapa: true,
          nome: true,
          ativo: true,
        },
        orderBy: { nome: "asc" },
      });

      return res.json(
        chapas.map((chapa) => ({
          id_chapeiro: chapa.matricula_chapa,
          matricula: chapa.matricula_chapa,
          nome: chapa.nome,
          ativo: chapa.ativo,
        })),
      );
    } catch (error) {
      console.error("Erro ao listar chapeiros:", error);
      return res.status(500).json({
        error: "Erro interno ao buscar chapeiros.",
      });
    }
  }
}
