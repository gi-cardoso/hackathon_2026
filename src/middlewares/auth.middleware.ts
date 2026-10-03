import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayloadInterno {
  sub: number;
  tipo: "INTERNO";
  role: string;
}

export interface JwtPayloadFornecedor {
  sub: number;
  tipo: "FORNECEDOR";
}

export type AuthPayload = JwtPayloadInterno | JwtPayloadFornecedor;

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export class AuthMiddleware {
  static verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Token ausente" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ error: "Token malformado" });
    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET || "default_secret";

    try {
      const decoded = jwt.verify(token, secret) as AuthPayload;

      // Validação básica de payload
      if (!decoded.sub || !decoded.tipo) {
        return res.status(401).json({ error: "Payload inválido" });
      }

      req.user = decoded;
      return next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: "Token expirado" });
      }
      return res.status(401).json({ error: "Token inválido" });
    }
  }

  static isInterno(req: Request, res: Response, next: NextFunction) {
    if (req.user?.tipo !== "INTERNO") {
      return res.status(403).json({ error: "Acesso negado. Requer usuário interno." });
    }
    return next();
  }

  static isFornecedor(req: Request, res: Response, next: NextFunction) {
    if (req.user?.tipo !== "FORNECEDOR") {
      return res.status(403).json({ error: "Acesso negado. Requer fornecedor." });
    }
    return next();
  }
}
