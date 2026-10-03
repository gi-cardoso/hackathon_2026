# 🚀 API Node.js + TypeScript + Express + Prisma + PostgreSQL (Docker)

Projeto backend estruturado com **Node.js**, **Express**, **TypeScript**, **Prisma ORM** e banco de dados **PostgreSQL** rodando via **Docker Compose**.

---

## 🛠️ Tecnologias Utilizadas

- **[Node.js](https://nodejs.org/)** (v22+)
- **[Express](https://expressjs.com/)** - Framework web para Node.js
- **[TypeScript](https://www.typescriptlang.org/)** - Superset tipado do JavaScript
- **[Prisma ORM](https://www.prisma.io/)** - ORM moderno para Node.js e TypeScript
- **[PostgreSQL](https://www.postgresql.org/)** (v16 Alpine) - Banco de dados relacional
- **[Docker](https://www.docker.com/)** & **[Docker Compose](https://docs.docker.com/compose/)** - Containerização do ambiente
- **[tsx](https://github.com/privatenumber/tsx)** - Executor TypeScript ultrarrápido com hot-reload

---

## 📁 Estrutura do Projeto

```text
Hackathon2026/
├── prisma/
│   └── schema.prisma         # Definição do schema e modelos do banco
├── src/
│   ├── controllers/
│   │   └── user.controller.ts # Lógica dos endpoints de usuários (CRUD)
│   ├── lib/
│   │   └── prisma.ts         # Instância singleton do Prisma Client
│   ├── routes/
│   │   ├── index.ts          # Agrupador de rotas e health check
│   │   └── user.routes.ts    # Rotas da entidade User
│   ├── app.ts                # Configuração da aplicação Express (middlewares e rotas)
│   └── server.ts             # Inicialização do servidor HTTP e shutdown gracioso
├── .dockerignore             # Arquivos ignorados no build Docker
├── .env                      # Variáveis de ambiente locais
├── .env.example              # Modelo de variáveis de ambiente
├── .gitignore                # Arquivos ignorados pelo Git
├── docker-compose.yml        # Configuração do container PostgreSQL
├── Dockerfile                # Build multi-estágio para containerizar a API
├── package.json              # Dependências e scripts do projeto
├── README.md                 # Documentação do projeto
└── tsconfig.json             # Configurações do compilador TypeScript
```

---

## 📋 Pré-requisitos

1. **[Node.js](https://nodejs.org/)** instalado (recomendado v20 ou v22).
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** instalado e **em execução**.

---

## ⚙️ Passo a Passo para Execução

### 1. Clonar ou Acessar o Diretório
```bash
cd Hackathon2026
```

### 2. Instalar as Dependências
Caso ainda não tenha instalado as dependências:
```bash
npm install
```

### 3. Iniciar o Banco de Dados com Docker Compose
Certifique-se de que o **Docker Desktop** esteja aberto e execute:
```bash
docker compose up -d
```
> O container `postgres_db` será iniciado na porta **5432**.

Para verificar se o container está saudável:
```bash
docker compose ps
```

### 4. Executar as Migrações do Prisma
Com o PostgreSQL rodando, execute a primeira migração para criar as tabelas no banco:
```bash
npx prisma migrate dev --name init
```
*(Esse comando criará o histórico de migração e gerará automaticamente o Prisma Client tipado)*

### 5. Iniciar a Aplicação em Modo de Desenvolvimento
```bash
npm run dev
```
A API estará disponível em: **`http://localhost:3000`**

---

## 🧪 Rotas da API e Exemplos de Uso

### 🩺 Health Check
- **GET** `http://localhost:3000/api/health`
- **Resposta**:
```json
{
  "status": "ok",
  "timestamp": "2026-10-02T22:00:00.000Z",
  "uptime": 12.34
}
```

---

### 👤 Gerenciamento de Usuários (CRUD)

#### 1. Criar Usuário
- **POST** `/api/users`
- **Header**: `Content-Type: application/json`
- **Body**:
```json
{
  "name": "Maria Silva",
  "email": "maria.silva@example.com"
}
```

#### 2. Listar Todos os Usuários
- **GET** `/api/users`

#### 3. Buscar Usuário por ID
- **GET** `/api/users/1`

#### 4. Atualizar Usuário
- **PUT** `/api/users/1`
- **Header**: `Content-Type: application/json`
- **Body**:
```json
{
  "name": "Maria Souza",
  "email": "maria.souza@example.com"
}
```

#### 5. Deletar Usuário
- **DELETE** `/api/users/1`

---

## 🗄️ Interface Visual do Banco (Prisma Studio)

O Prisma inclui uma interface web interativa para visualizar e manipular dados diretamente no navegador:

```bash
npm run prisma:studio
```
Acesse em: **`http://localhost:5555`**

---

## 📜 Scripts Disponíveis no `package.json`

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor com hot-reload via `tsx` |
| `npm run build` | Compila o TypeScript para JavaScript na pasta `dist/` |
| `npm start` | Roda a versão de produção compilada (`dist/server.js`) |
| `npm run prisma:generate` | Gera os tipos do Prisma Client |
| `npm run prisma:migrate` | Aplica migrações no banco de dados |
| `npm run prisma:studio` | Abre a interface visual Prisma Studio |
| `npm run docker:up` | Sobe os serviços do Docker Compose em segundo plano |
| `npm run docker:down` | Para e remove os containers do Docker Compose |

---

## 🐳 Comandos Úteis do Docker

- **Subir PostgreSQL**: `docker compose up -d`
- **Ver logs do PostgreSQL**: `docker compose logs -f postgres`
- **Parar PostgreSQL**: `docker compose down`
- **Parar e remover volumes (limpar dados)**: `docker compose down -v`
