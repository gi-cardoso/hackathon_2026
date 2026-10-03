import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export class UserController {
  // Criar um novo usuário
  static async create(req: Request, res: Response) {
    try {
      const { email, name } = req.body;

      if (!email || !name) {
        return res.status(400).json({ error: "Email e nome são obrigatórios" });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: "Email já cadastrado" });
      }

      const user = await prisma.user.create({
        data: { email, name },
      });

      return res.status(201).json(user);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  // Listar todos os usuários
  static async getAll(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.json(users);
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  // Obter um usuário por ID
  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      return res.json(user);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  // Atualizar um usuário
  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const { email, name } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const existingUser = await prisma.user.findUnique({ where: { id } });
      if (!existingUser) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      if (email && email !== existingUser.email) {
        const emailInUse = await prisma.user.findUnique({ where: { email } });
        if (emailInUse) {
          return res.status(409).json({ error: "Email já está em uso" });
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          email: email ?? existingUser.email,
          name: name ?? existingUser.name,
        },
      });

      return res.json(updatedUser);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  // Deletar um usuário
  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      await prisma.user.delete({ where: { id } });

      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
}
