import test, { describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const app = express();
app.use(express.json());

app.get("/api/admin-only", AuthMiddleware.verifyToken, AuthMiddleware.hasRole(["ADMIN"]), (req, res) => {
  res.json({ ok: true, user: req.user });
});

app.get("/api/armazem-ou-admin", AuthMiddleware.verifyToken, AuthMiddleware.hasRole(["ADMIN", "ARMAZEM"]), (req, res) => {
  res.json({ ok: true, user: req.user });
});

describe("Auth Middleware - Role Validation", () => {
  const secret = process.env.JWT_SECRET || "default_secret";

  it("deve permitir acesso para uma role permitida", async () => {
    const token = jwt.sign({ sub: 1, tipo: "INTERNO", role: "ADMIN" }, secret);
    const res = await request(app)
      .get("/api/admin-only")
      .set("Authorization", `Bearer ${token}`);
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.role, "ADMIN");
  });

  it("deve bloquear acesso para uma role não permitida", async () => {
    const token = jwt.sign({ sub: 2, tipo: "INTERNO", role: "CONTAS" }, secret);
    const res = await request(app)
      .get("/api/admin-only")
      .set("Authorization", `Bearer ${token}`);
    
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.error, "Acesso negado. Permissão insuficiente.");
  });

  it("deve permitir acesso múltiplo quando a role está na lista", async () => {
    const token = jwt.sign({ sub: 3, tipo: "INTERNO", role: "ARMAZEM" }, secret);
    const res = await request(app)
      .get("/api/armazem-ou-admin")
      .set("Authorization", `Bearer ${token}`);
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.role, "ARMAZEM");
  });

  it("deve bloquear usuário não autenticado (falha antes da role ou na verificação direta)", async () => {
    // Sem token
    const res = await request(app).get("/api/admin-only");
    assert.strictEqual(res.status, 401);
  });

  it("deve bloquear acesso quando a role for inválida", async () => {
    const token = jwt.sign({ sub: 4, tipo: "INTERNO", role: "ROLE_INEXISTENTE" }, secret);
    const res = await request(app)
      .get("/api/armazem-ou-admin")
      .set("Authorization", `Bearer ${token}`);
    
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.error, "Acesso negado. Permissão insuficiente.");
  });

  it("deve bloquear um FORNECEDOR de utilizar rotas internas baseadas em roles", async () => {
    const token = jwt.sign({ sub: 99, tipo: "FORNECEDOR" }, secret);
    const res = await request(app)
      .get("/api/admin-only")
      .set("Authorization", `Bearer ${token}`);
    
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.error, "Acesso negado. Fornecedores não possuem permissões internas.");
  });
});
