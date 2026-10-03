import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

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

      // Autenticar usuário
      return res.json({
        message: "Login realizado com sucesso",
        user: usuarioSemSenha,
        // token: será implementado em etapa posterior
      });
    } catch (error) {
      console.error("Erro no login interno:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
}
