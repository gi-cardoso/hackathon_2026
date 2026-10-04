# Hackathon 2026

Backend da aplicação de recebimento e operação de cargas da Cocapec, com
frontends para operação interna e fornecedores.

O projeto permite:

- autenticar usuários internos e fornecedores;
- receber e interpretar notas fiscais em XML ou PDF;
- armazenar o arquivo original em pastas separadas;
- impedir o cadastro duplicado da mesma nota fiscal;
- criar e analisar agendamentos de recebimento;
- registrar recebimentos, descargas e não recebimentos;
- cadastrar boletins diários com a equipe de chapas;
- consultar dados operacionais por dashboard.

## Tecnologias

- Node.js 22+
- TypeScript
- Express
- Prisma ORM
- PostgreSQL 16
- Docker Compose
- JWT
- Multer
- `fast-xml-parser`
- `pdf-parse`
- React/Vite nos frontends


## Pré-requisitos

- Node.js 22 ou superior;
- npm;
- Docker Desktop em execução;
- PostgreSQL via Docker Compose ou uma instância PostgreSQL compatível.

## Configuração

Copie o arquivo de exemplo:

```bash
copy .env.example .env
```

No PowerShell, o equivalente é:

```powershell
Copy-Item .env.example .env
```

Configure principalmente:

```env
PORT=3000
NODE_ENV=development
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=hackathon_db
POSTGRES_PORT=5433
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/hackathon_db?schema=public"
JWT_SECRET=uma-chave-secreta-local
```

O `POSTGRES_PORT` deve ser o mesmo utilizado no `DATABASE_URL`. O
`docker-compose.yml` expõe o PostgreSQL na porta `5433` por padrão.

## Instalação e execução

Na raiz do projeto:

```bash
npm install
npm run docker:up
npx prisma generate
npx prisma migrate deploy
npm run dev
```


Para compilar e executar a versão de produção:

```bash
npm run build
npm start
```

Para iniciar o backend e os dois frontends simultaneamente:

```bash
npm run dev:all
```

Portas dos frontends:

- operação interna: `http://localhost:5173`;
- fornecedor: `http://localhost:5174`.

## Banco de dados e Prisma

Subir o PostgreSQL:

```bash
npm run docker:up
```

Aplicar migrações existentes:

```bash
npx prisma migrate deploy
```

Em desenvolvimento, criar uma nova migração:

```bash
npx prisma migrate dev --name nome_da_migracao
```

Regenerar o client:

```bash
npm run prisma:generate
```

Abrir o Prisma Studio:

```bash
npm run prisma:studio
```

O Studio normalmente estará disponível em
`http://localhost:5555`.

## Autenticação

As rotas protegidas usam:

```http
Authorization: Bearer <token>
```

Login de usuário interno:

```http
POST /api/auth/internal/login
Content-Type: application/json
```

```json
{
  "email": "admin@example.com",
  "senha": "senha"
}
```

Login de fornecedor:

```http
POST /api/auth/fornecedor/login
Content-Type: application/json
```

```json
{
  "cnpj": "12345678000199",
  "senha": "senha"
}
```

Os perfis internos usados nas regras de autorização incluem `ADMIN`,
`COMPRAS` e `ARMAZEM`. Fornecedores possuem token próprio e só podem
operar sobre sua própria identidade.

## Endpoints principais

Todas as rotas abaixo usam o prefixo `http://localhost:3000`.

### Health check

```http
GET /api/health
```

### Usuários

```http
POST   /api/users
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

### Fornecedores

```http
GET  /api/fornecedores
POST /api/fornecedores
```

### Notas fiscais

O upload deve ser feito como `multipart/form-data`, usando o campo `file`:

```http
POST /api/invoices/parse
Content-Type: multipart/form-data
```

O endpoint aceita XML e PDF. O sistema:

1. interpreta os dados da nota;
2. salva o arquivo original em `notas-fiscais/xml` ou `notas-fiscais/pdf`;
3. grava os dados completos em `NotaFiscal.dados_completos`;
4. grava os metadados e o caminho do arquivo;
5. rejeita outra nota com a mesma chave de acesso.

Uma tentativa de duplicar a chave retorna `409 Conflict`.

Também é possível enviar XML diretamente:

```http
POST /api/invoices/parse
Content-Type: application/json
```

```json
{
  "xml": "<nfeProc>...</nfeProc>"
}
```

### Chapeiros

Listar chapeiros ativos:

```http
GET /api/chapas
```

Listar também os inativos:

```http
GET /api/chapas?ativo=false
```

Resposta:

```json
[
  {
    "id_chapeiro": "CHAPA001",
    "matricula": "CHAPA001",
    "nome": "Nome do Chapeiro",
    "ativo": true
  }
]
```

### Agendamentos

Fornecedor:

```http
POST  /api/agendamentos
GET   /api/agendamentos/disponibilidade
GET   /api/agendamentos/me
PATCH /api/agendamentos/:id/cancelar
PATCH /api/agendamentos/:id/reagendar
```

Compras/Admin:

```http
GET   /api/agendamentos/analise/compras
GET   /api/agendamentos/analise/compras/:id
PATCH /api/agendamentos/analise/compras/:id/decisao
```

Exemplo de criação:

```json
{
  "id_nota": 1,
  "data_agendada": "2026-10-08",
  "horario_agendado": "08:00",
  "tipo_acondicionamento": "BATIDO",
  "peso_total": 28000,
  "numero_pedido_compra": "PC-123",
  "itens": [
    {
      "codigo_item_cocapec": "ITEM-001",
      "descricao_item": "Produto",
      "quantidade": 10,
      "codigo_deposito": "DEP-01"
    }
  ]
}
```

Horários disponíveis:

- `08:00`
- `10:00`
- `13:00`
- `15:00`

Regras de capacidade:

- uma carga `BATIDO` ocupa o horário sozinha;
- `PALETIZADO` e `BIG_BAG` podem compartilhar o horário;
- o limite para cargas não `BATIDO` é de dois caminhões;
- agendamentos reprovados ou cancelados não ocupam capacidade.

Previsão de chapas:

| Regra | Previsão |
| --- | ---: |
| Peso menor que 500 kg | 0 |
| `BATIDO` com 500 kg ou mais | 5 |
| `PALETIZADO` | 2 |
| `BIG_BAG` | 2 |

O agendamento é criado com status `PENDENTE`, junto com a carga, seus
itens e a validação de compras também `PENDENTE`, em uma transação.

### Boletins diários

```http
POST /api/boletins
GET  /api/boletins
GET  /api/boletins/:id
```

O cadastro exige ao menos um item de produção e uma equipe de chapas.
A equipe é informada manualmente usando a matrícula ou `id_chapeiro`
retornado por `GET /api/chapas`:

```json
{
  "data": "2026-10-04",
  "responsavelId": 1,
  "producao": [
    {
      "tipoItem": "DESCARGA",
      "descarga": 10,
      "remocao": 0,
      "transferencia": 0
    }
  ],
  "equipe": [
    {
      "id_chapeiro": "CHAPA001",
      "jornada": "COMPLETA"
    }
  ]
}
```

Jornadas aceitas:

- `COMPLETA`
- `MEIA`

### Operação de armazém

Recebimentos:

```http
POST /api/recebimentos
GET  /api/recebimentos/:id
```

Não recebimentos:

```http
GET  /api/nao-recebimentos/motivos
POST /api/nao-recebimentos
GET  /api/nao-recebimentos
GET  /api/nao-recebimentos/:id
```

Catálogos:

```http
GET /api/armazens
GET /api/equipamentos
```

### Dashboard

```http
GET /api/dashboard/operacao
```

Filtros opcionais:

```text
?data_inicio=2026-10-01&data_fim=2026-10-31&id_armazem=5
```

## Scripts npm

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o backend com hot reload |
| `npm run dev:all` | Inicia backend e frontends |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Executa o backend compilado |
| `npm run prisma:generate` | Regenera o Prisma Client |
| `npm run prisma:migrate` | Executa `prisma migrate dev` |
| `npm run prisma:studio` | Abre o Prisma Studio |
| `npm run docker:up` | Inicia o PostgreSQL |
| `npm run docker:down` | Para os containers |

## Testes e validação

Compilar o backend:

```bash
npm run build
```

Executar os testes Node existentes:

```bash
node --test
```

## Encerramento

Para parar a aplicação, encerre o processo do backend. Para parar o
PostgreSQL:

```bash
npm run docker:down
```

Para remover também os dados persistidos do banco:

```bash
docker compose down -v
```
