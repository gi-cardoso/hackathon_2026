import test, { describe, it, mock, afterEach } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app } from "../app";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

describe("POST /api/auth/internal/login", () => {
  const originalFindFirst = prisma.usuario.findFirst;
  const originalCompare = bcrypt.compare;

  afterEach(() => {
    prisma.usuario.findFirst = originalFindFirst;
    bcrypt.compare = originalCompare;
  });

  it("deve retornar erro 400 se email ou senha não forem fornecidos", async () => {
    const res = await request(app).post("/api/auth/internal/login").send({
      email: "teste@empresa.com",
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error, "E-mail e senha são obrigatórios");
  });

  it("deve retornar 401 para usuário não encontrado", async () => {
    prisma.usuario.findFirst = async () => null as any;

    const res = await request(app).post("/api/auth/internal/login").send({
      email: "inexistente@empresa.com",
      senha: "123",
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.error, "Credenciais inválidas");
  });

  it("deve retornar 403 para usuário inativo", async () => {
    prisma.usuario.findFirst = async () => ({
      id_usuario: 1,
      nome: "Inativo",
      email: "inativo@empresa.com",
      ativo: false,
      senha_hash: "hash",
    }) as any;

    const res = await request(app).post("/api/auth/internal/login").send({
      email: "inativo@empresa.com",
      senha: "123",
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.error, "Usuário inativo");
  });

  it("deve retornar 401 para senha incorreta", async () => {
    prisma.usuario.findFirst = async () => ({
      id_usuario: 1,
      nome: "Ativo",
      email: "ativo@empresa.com",
      ativo: true,
      senha_hash: "hash_real",
    }) as any;
    
    bcrypt.compare = async () => false as any;

    const res = await request(app).post("/api/auth/internal/login").send({
      email: "ativo@empresa.com",
      senha: "senha_errada",
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.error, "Credenciais inválidas");
  });

  it("deve autenticar o usuário com sucesso com senha correta", async () => {
    prisma.usuario.findFirst = async () => ({
      id_usuario: 1,
      nome: "Admin",
      matricula: "001",
      email: "admin@empresa.com",
      ativo: true,
      role: "ADMIN",
      senha_hash: "hash_real",
    }) as any;
    
    bcrypt.compare = async () => true as any;

    const res = await request(app).post("/api/auth/internal/login").send({
      email: "admin@empresa.com",
      senha: "senha_correta",
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.message, "Login realizado com sucesso");
    assert.strictEqual(res.body.user.nome, "Admin");
    assert.strictEqual(res.body.user.senha_hash, undefined);
  });
});
