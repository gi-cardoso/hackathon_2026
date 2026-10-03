import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthController {
  static async internalLogin(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
      }

      // buscar Usuario (verificar existência)
      const usuario = await prisma.usuario.findFirst({
        where: { email },
      });

      if (!usuario) {
        // Não expor que o usuário não existe
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      // verificar ativo
      if (!usuario.ativo) {
        return res.status(403).json({ error: "Usuário inativo" });
      }

      // comparar senha com senha_hash existente
      const isPasswordValid = await bcrypt.compare(senha, usuario.senha_hash);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      // Remover o hash da resposta para segurança
      const { senha_hash, ...usuarioSemSenha } = usuario;

      // Gerar JWT
      const secret = process.env.JWT_SECRET || "default_secret";
      const token = jwt.sign(
        {
          sub: usuario.id_usuario,
          tipo: "INTERNO",
          role: usuario.role,
        },
        secret,
        { expiresIn: "1h" }
      );

      // Autenticar usuário
      return res.json({
        message: "Login realizado com sucesso",
        user: usuarioSemSenha,
        token,
      });
    } catch (error) {
      console.error("Erro no login interno:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  static async fornecedorLogin(req: Request, res: Response) {
    try {
      const { cnpj, senha } = req.body;

      if (!cnpj || !senha) {
        return res.status(400).json({ error: "CNPJ e senha são obrigatórios" });
      }

      const fornecedor = await prisma.fornecedor.findFirst({
        where: { cnpj },
      });

      if (!fornecedor || !fornecedor.senha_hash) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      if (!fornecedor.ativo) {
        return res.status(403).json({ error: "Fornecedor inativo" });
      }

      const isPasswordValid = await bcrypt.compare(senha, fornecedor.senha_hash);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      const { senha_hash, ...fornecedorSemSenha } = fornecedor;

      const secret = process.env.JWT_SECRET || "default_secret";
      const token = jwt.sign(
        {
          sub: fornecedor.id_fornecedor,
          tipo: "FORNECEDOR",
        },
        secret,
        { expiresIn: "1h" }
      );

      return res.json({
        message: "Login realizado com sucesso",
        user: fornecedorSemSenha,
        token,
      });
    } catch (error) {
      console.error("Erro no login do fornecedor:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
}
