import test, { describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const app = express();
app.use(express.json());

// Rota de teste
app.post(
  "/api/agendamentos",
  AuthMiddleware.verifyToken,
  AuthMiddleware.enforceFornecedorIdentity,
  (req, res) => {
    res.json({ ok: true, currentFornecedorId: req.currentFornecedorId });
  }
);

app.get(
  "/api/agendamentos/:id_fornecedor",
  AuthMiddleware.verifyToken,
  AuthMiddleware.enforceFornecedorIdentity,
  (req, res) => {
    res.json({ ok: true, currentFornecedorId: req.currentFornecedorId });
  }
);

describe("Auth Middleware - Fornecedor Identity Enforcement", () => {
  const secret = process.env.JWT_SECRET || "default_secret";

  it("deve permitir a requisição sem id_fornecedor e extrair o currentFornecedorId corretamente", async () => {
    const token = jwt.sign({ sub: 10, tipo: "FORNECEDOR" }, secret);
    
    const res = await request(app)
      .post("/api/agendamentos")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.currentFornecedorId, 10);
  });

  it("deve bloquear se o fornecedor enviar um id_fornecedor no body que pertence a outro fornecedor", async () => {
    const token = jwt.sign({ sub: 10, tipo: "FORNECEDOR" }, secret);
    
    const res = await request(app)
      .post("/api/agendamentos")
      .set("Authorization", `Bearer ${token}`)
      .send({ id_fornecedor: 25 });
    
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.error, "Acesso negado. Operação não autorizada para outro fornecedor.");
  });

  it("deve bloquear se o fornecedor enviar um id_fornecedor na query diferente do seu", async () => {
    const token = jwt.sign({ sub: 10, tipo: "FORNECEDOR" }, secret);
    
    const res = await request(app)
      .post("/api/agendamentos?id_fornecedor=25")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.error, "Acesso negado. Operação não autorizada para outro fornecedor.");
  });

  it("deve bloquear se o fornecedor enviar um id_fornecedor no params diferente do seu", async () => {
    const token = jwt.sign({ sub: 10, tipo: "FORNECEDOR" }, secret);
    
    const res = await request(app)
      .get("/api/agendamentos/25")
      .set("Authorization", `Bearer ${token}`);
    
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.error, "Acesso negado. Operação não autorizada para outro fornecedor.");
  });

  it("deve permitir a requisição se o fornecedor enviar o seu PRÓPRIO id_fornecedor no body", async () => {
    const token = jwt.sign({ sub: 10, tipo: "FORNECEDOR" }, secret);
    
    const res = await request(app)
      .post("/api/agendamentos")
      .set("Authorization", `Bearer ${token}`)
      .send({ id_fornecedor: 10 });
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.currentFornecedorId, 10);
  });
});
