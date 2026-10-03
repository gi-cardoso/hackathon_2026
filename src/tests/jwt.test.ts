import test, { describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const app = express();
app.use(express.json());

// Rotas protegidas para testes
app.get("/api/protected", AuthMiddleware.verifyToken, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/protected/interno", AuthMiddleware.verifyToken, AuthMiddleware.isInterno, (req, res) => {
  res.json({ ok: true, user: req.user });
});

app.get("/api/protected/fornecedor", AuthMiddleware.verifyToken, AuthMiddleware.isFornecedor, (req, res) => {
  res.json({ ok: true, user: req.user });
});

describe("Auth Middleware - JWT Validation", () => {
  const secret = process.env.JWT_SECRET || "default_secret";

  it("deve retornar erro 401 se o token estiver ausente", async () => {
    const res = await request(app).get("/api/protected");
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.error, "Token ausente");
  });

  it("deve retornar erro 401 se o token estiver malformado", async () => {
    const res = await request(app).get("/api/protected").set("Authorization", "TokenInvalido");
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.error, "Token malformado");
  });

  it("deve retornar erro 401 se o token for inválido", async () => {
    const res = await request(app)
      .get("/api/protected")
      .set("Authorization", "Bearer invalid.token.value");
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.error, "Token inválido");
  });

  it("deve retornar erro 401 se o token estiver expirado", async () => {
    const expiredToken = jwt.sign({ sub: 1, tipo: "INTERNO", role: "ADMIN" }, secret, { expiresIn: "-1h" });
    const res = await request(app)
      .get("/api/protected")
      .set("Authorization", `Bearer ${expiredToken}`);
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.error, "Token expirado");
  });

  it("deve validar corretamente o JWT de um usuário INTERNO", async () => {
    const token = jwt.sign({ sub: 15, tipo: "INTERNO", role: "ADMIN" }, secret, { expiresIn: "1h" });
    const res = await request(app)
      .get("/api/protected/interno")
      .set("Authorization", `Bearer ${token}`);
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.sub, 15);
    assert.strictEqual(res.body.user.tipo, "INTERNO");
    assert.strictEqual(res.body.user.role, "ADMIN");
  });

  it("deve bloquear fornecedor tentando acessar rota de interno", async () => {
    const token = jwt.sign({ sub: 8, tipo: "FORNECEDOR" }, secret, { expiresIn: "1h" });
    const res = await request(app)
      .get("/api/protected/interno")
      .set("Authorization", `Bearer ${token}`);
    
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.error, "Acesso negado. Requer usuário interno.");
  });

  it("deve validar corretamente o JWT de um FORNECEDOR", async () => {
    const token = jwt.sign({ sub: 8, tipo: "FORNECEDOR" }, secret, { expiresIn: "1h" });
    const res = await request(app)
      .get("/api/protected/fornecedor")
      .set("Authorization", `Bearer ${token}`);
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.sub, 8);
    assert.strictEqual(res.body.user.tipo, "FORNECEDOR");
  });
});
