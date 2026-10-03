import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

export class FornecedorController {
  static async create(req: Request, res: Response) {
    try {
      const {
        codigo_fornecedor_cocapec,
        nome_fornecedor,
        cnpj,
        contato,
        senha,
        ativo,
      } = req.body;

      if (!nome_fornecedor || !cnpj || !senha) {
        return res.status(400).json({
          error: "nome_fornecedor, cnpj e senha são obrigatórios",
        });
      }

      const cnpjNormalizado = String(cnpj).replace(/\D/g, "");
      if (cnpjNormalizado.length !== 14) {
        return res.status(400).json({ error: "CNPJ inválido" });
      }

      const fornecedorExistente = await prisma.fornecedor.findFirst({
        where: {
          OR: [
            { cnpj: cnpjNormalizado },
            codigo_fornecedor_cocapec
              ? { codigo_fornecedor_cocapec: String(codigo_fornecedor_cocapec) }
              : undefined,
          ].filter(Boolean) as Array<{
            cnpj?: string;
            codigo_fornecedor_cocapec?: string;
          }>,
        },
      });

      if (fornecedorExistente) {
        return res.status(409).json({ error: "CNPJ ou código já cadastrado" });
      }

      const senha_hash = await bcrypt.hash(String(senha), 10);
      const fornecedor = await prisma.fornecedor.create({
        data: {
          codigo_fornecedor_cocapec: codigo_fornecedor_cocapec
            ? String(codigo_fornecedor_cocapec)
            : undefined,
          nome_fornecedor: String(nome_fornecedor),
          cnpj: cnpjNormalizado,
          contato: contato ? String(contato) : undefined,
          senha_hash,
          ativo: ativo ?? true,
        },
      });

      const { senha_hash: _, ...fornecedorSemSenha } = fornecedor;
      return res.status(201).json(fornecedorSemSenha);
    } catch (error) {
      console.error("Erro ao criar fornecedor:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
}