import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

export class UserController {
  static async create(req: Request, res: Response) {
    try {
      const { email, nome, matricula, senha, role, ativo } = req.body;

      if (!email || !nome || !matricula || !senha || !role) {
        return res.status(400).json({ error: "Campos obrigatórios ausentes" });
      }

      const existingUser = await prisma.usuario.findFirst({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: "Email já cadastrado" });
      }

      const senha_hash = await bcrypt.hash(senha, 10);

      const user = await prisma.usuario.create({
        data: { email, nome, matricula, senha_hash, role, ativo: ativo ?? true },
      });

      const { senha_hash: _, ...userSemSenha } = user;
      return res.status(201).json(userSemSenha);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const users = await prisma.usuario.findMany();
      const safeUsers = users.map(u => {
        const { senha_hash, ...rest } = u;
        return rest;
      });
      return res.json(safeUsers);
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id_usuario = parseInt(String(req.params.id), 10);
      if (isNaN(id_usuario)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const user = await prisma.usuario.findUnique({ where: { id_usuario } });
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const { senha_hash, ...userSemSenha } = user;
      return res.json(userSemSenha);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  static async update(req: Request, res: Response) {
    // Implementação básica
    return res.status(501).json({ error: "Não implementado" });
  }

  static async delete(req: Request, res: Response) {
    try {
      const id_usuario = parseInt(String(req.params.id), 10);
      if (isNaN(id_usuario)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const user = await prisma.usuario.findUnique({ where: { id_usuario } });
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      await prisma.usuario.delete({ where: { id_usuario } });

      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
}
