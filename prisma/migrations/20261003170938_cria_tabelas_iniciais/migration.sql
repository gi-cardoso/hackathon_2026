-- CreateTable
CREATE TABLE "fornecedores" (
    "id_fornecedor" SERIAL NOT NULL,
    "codigo_fornecedor_cocapec" TEXT,
    "nome_fornecedor" TEXT NOT NULL,
    "cnpj" TEXT,
    "contato" TEXT,
    "ativo" BOOLEAN NOT NULL,

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id_fornecedor")
);

-- CreateTable
CREATE TABLE "nota_fiscal" (
    "id_nota" SERIAL NOT NULL,
    "id_fornecedor" INTEGER,
    "numero_nf" TEXT NOT NULL,
    "chave_acesso" VARCHAR(44) NOT NULL,
    "arquivo_nf" TEXT,

    CONSTRAINT "nota_fiscal_pkey" PRIMARY KEY ("id_nota")
);

-- CreateTable
CREATE TABLE "agendamentos" (
    "id_agendamento" SERIAL NOT NULL,
    "id_fornecedor" INTEGER,
    "id_nota" INTEGER,
    "numero_pedido_compra" TEXT,
    "data_agendada" DATE NOT NULL,
    "horario_agendado" TEXT NOT NULL,
    "tipo_acondicionamento" TEXT NOT NULL,
    "status_agendamento" TEXT NOT NULL,

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id_agendamento")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "validacao" (
    "id_validacao" SERIAL NOT NULL,
    "id_agendamento" INTEGER,
    "tipo_validacao" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responsavel_id" INTEGER,

    CONSTRAINT "validacao_pkey" PRIMARY KEY ("id_validacao")
);

-- CreateTable
CREATE TABLE "carga" (
    "id_carga" SERIAL NOT NULL,
    "id_agendamento" INTEGER,
    "peso_total" DECIMAL(65,30) NOT NULL,
    "tipo_acondicionamento" TEXT NOT NULL,

    CONSTRAINT "carga_pkey" PRIMARY KEY ("id_carga")
);

-- CreateTable
CREATE TABLE "carga_destino" (
    "id_carga" INTEGER NOT NULL,
    "id_armazem" INTEGER NOT NULL,

    CONSTRAINT "carga_destino_pkey" PRIMARY KEY ("id_carga","id_armazem")
);

-- CreateTable
CREATE TABLE "item_carga" (
    "id_item_carga" SERIAL NOT NULL,
    "id_carga" INTEGER,
    "codigo_item_cocapec" TEXT NOT NULL,
    "descricao_item" TEXT NOT NULL,
    "quantidade" DECIMAL(65,30) NOT NULL,
    "codigo_deposito" TEXT,

    CONSTRAINT "item_carga_pkey" PRIMARY KEY ("id_item_carga")
);

-- CreateTable
CREATE TABLE "nao_recebimento" (
    "id" SERIAL NOT NULL,
    "id_agendamento" INTEGER,
    "motivo_padronizado" TEXT NOT NULL,
    "observacao" TEXT,

    CONSTRAINT "nao_recebimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recebimento" (
    "id_recebimento" SERIAL NOT NULL,
    "id_agendamento" INTEGER,
    "hora_chegada" TIMESTAMP(3) NOT NULL,
    "hora_entrada" TIMESTAMP(3),
    "hora_saida" TIMESTAMP(3),
    "status_recebimento" TEXT NOT NULL,

    CONSTRAINT "recebimento_pkey" PRIMARY KEY ("id_recebimento")
);

-- CreateTable
CREATE TABLE "armazem" (
    "id_armazem" SERIAL NOT NULL,
    "nome_armazem" TEXT NOT NULL,
    "codigo_deposito" TEXT,
    "grupo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL,

    CONSTRAINT "armazem_pkey" PRIMARY KEY ("id_armazem")
);

-- CreateTable
CREATE TABLE "descarga" (
    "id_descarga" SERIAL NOT NULL,
    "id_recebimento" INTEGER,
    "id_armazem" INTEGER,
    "quantidade_movimentada" DECIMAL(65,30) NOT NULL,
    "qtd_chapas_utilizados" INTEGER NOT NULL,

    CONSTRAINT "descarga_pkey" PRIMARY KEY ("id_descarga")
);

-- CreateTable
CREATE TABLE "chapa" (
    "matricula_chapa" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL,

    CONSTRAINT "chapa_pkey" PRIMARY KEY ("matricula_chapa")
);

-- CreateTable
CREATE TABLE "equipamento" (
    "id_tipo_equipamento" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "armazem_base" TEXT,
    "quantidade_disponivel" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL,

    CONSTRAINT "equipamento_pkey" PRIMARY KEY ("id_tipo_equipamento")
);

-- CreateTable
CREATE TABLE "descarga_chapa" (
    "id_descarga" INTEGER NOT NULL,
    "matricula_chapa" TEXT NOT NULL,

    CONSTRAINT "descarga_chapa_pkey" PRIMARY KEY ("id_descarga","matricula_chapa")
);

-- CreateTable
CREATE TABLE "descarga_equipamento" (
    "id_descarga" INTEGER NOT NULL,
    "id_tipo_equipamento" INTEGER NOT NULL,
    "quantidade_utilizada" INTEGER NOT NULL,

    CONSTRAINT "descarga_equipamento_pkey" PRIMARY KEY ("id_descarga","id_tipo_equipamento")
);

-- CreateTable
CREATE TABLE "boletim_diario" (
    "id_boletim" SERIAL NOT NULL,
    "id_armazem" INTEGER,
    "data" DATE NOT NULL,
    "responsavel_id" INTEGER,
    "diarias_equivalentes_total" DECIMAL(65,30) NOT NULL,
    "valor_produzido_total" DECIMAL(65,30) NOT NULL,
    "complemento_diaria_pago" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "boletim_diario_pkey" PRIMARY KEY ("id_boletim")
);

-- CreateTable
CREATE TABLE "item_boletim" (
    "id_item_boletim" SERIAL NOT NULL,
    "id_boletim" INTEGER,
    "tipo_servico" TEXT NOT NULL,
    "quantidade" DECIMAL(65,30) NOT NULL,
    "preco_unitario" DECIMAL(65,30) NOT NULL,
    "valor_producao" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "item_boletim_pkey" PRIMARY KEY ("id_item_boletim")
);

-- CreateTable
CREATE TABLE "equipe_diaria" (
    "id" SERIAL NOT NULL,
    "id_boletim" INTEGER,
    "matricula_chapa" TEXT,
    "tipo_jornada" TEXT NOT NULL,

    CONSTRAINT "equipe_diaria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_codigo_fornecedor_cocapec_key" ON "fornecedores"("codigo_fornecedor_cocapec");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_cnpj_key" ON "fornecedores"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "armazem_codigo_deposito_key" ON "armazem"("codigo_deposito");

-- AddForeignKey
ALTER TABLE "nota_fiscal" ADD CONSTRAINT "nota_fiscal_id_fornecedor_fkey" FOREIGN KEY ("id_fornecedor") REFERENCES "fornecedores"("id_fornecedor") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_id_fornecedor_fkey" FOREIGN KEY ("id_fornecedor") REFERENCES "fornecedores"("id_fornecedor") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_id_nota_fkey" FOREIGN KEY ("id_nota") REFERENCES "nota_fiscal"("id_nota") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validacao" ADD CONSTRAINT "validacao_id_agendamento_fkey" FOREIGN KEY ("id_agendamento") REFERENCES "agendamentos"("id_agendamento") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validacao" ADD CONSTRAINT "validacao_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carga" ADD CONSTRAINT "carga_id_agendamento_fkey" FOREIGN KEY ("id_agendamento") REFERENCES "agendamentos"("id_agendamento") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carga_destino" ADD CONSTRAINT "carga_destino_id_carga_fkey" FOREIGN KEY ("id_carga") REFERENCES "carga"("id_carga") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carga_destino" ADD CONSTRAINT "carga_destino_id_armazem_fkey" FOREIGN KEY ("id_armazem") REFERENCES "armazem"("id_armazem") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_carga" ADD CONSTRAINT "item_carga_id_carga_fkey" FOREIGN KEY ("id_carga") REFERENCES "carga"("id_carga") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nao_recebimento" ADD CONSTRAINT "nao_recebimento_id_agendamento_fkey" FOREIGN KEY ("id_agendamento") REFERENCES "agendamentos"("id_agendamento") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recebimento" ADD CONSTRAINT "recebimento_id_agendamento_fkey" FOREIGN KEY ("id_agendamento") REFERENCES "agendamentos"("id_agendamento") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descarga" ADD CONSTRAINT "descarga_id_recebimento_fkey" FOREIGN KEY ("id_recebimento") REFERENCES "recebimento"("id_recebimento") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descarga" ADD CONSTRAINT "descarga_id_armazem_fkey" FOREIGN KEY ("id_armazem") REFERENCES "armazem"("id_armazem") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descarga_chapa" ADD CONSTRAINT "descarga_chapa_id_descarga_fkey" FOREIGN KEY ("id_descarga") REFERENCES "descarga"("id_descarga") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descarga_chapa" ADD CONSTRAINT "descarga_chapa_matricula_chapa_fkey" FOREIGN KEY ("matricula_chapa") REFERENCES "chapa"("matricula_chapa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descarga_equipamento" ADD CONSTRAINT "descarga_equipamento_id_descarga_fkey" FOREIGN KEY ("id_descarga") REFERENCES "descarga"("id_descarga") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descarga_equipamento" ADD CONSTRAINT "descarga_equipamento_id_tipo_equipamento_fkey" FOREIGN KEY ("id_tipo_equipamento") REFERENCES "equipamento"("id_tipo_equipamento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boletim_diario" ADD CONSTRAINT "boletim_diario_id_armazem_fkey" FOREIGN KEY ("id_armazem") REFERENCES "armazem"("id_armazem") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boletim_diario" ADD CONSTRAINT "boletim_diario_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_boletim" ADD CONSTRAINT "item_boletim_id_boletim_fkey" FOREIGN KEY ("id_boletim") REFERENCES "boletim_diario"("id_boletim") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipe_diaria" ADD CONSTRAINT "equipe_diaria_id_boletim_fkey" FOREIGN KEY ("id_boletim") REFERENCES "boletim_diario"("id_boletim") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipe_diaria" ADD CONSTRAINT "equipe_diaria_matricula_chapa_fkey" FOREIGN KEY ("matricula_chapa") REFERENCES "chapa"("matricula_chapa") ON DELETE SET NULL ON UPDATE CASCADE;
