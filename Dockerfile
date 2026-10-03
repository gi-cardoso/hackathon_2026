# Estágio de Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instala todas as dependências (incluindo dev)
RUN npm install

# Copia o código fonte e configurações
COPY tsconfig.json ./
COPY src ./src

# Gera os artefatos do Prisma Client e compila TypeScript
RUN npx prisma generate
RUN npm run build

# Estágio de Produção
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copia arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instala apenas dependências de produção
RUN npm ci --only=production
RUN npx prisma generate

# Copia o build compilado do estágio anterior
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]
