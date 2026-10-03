/*
  Warnings:

  - Added the required column `atualizado_em` to the `nota_fiscal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "nota_fiscal" ADD COLUMN     "atualizado_em" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "caminho_arquivo" TEXT,
ADD COLUMN     "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dados_completos" JSONB,
ADD COLUMN     "data_emissao" TIMESTAMP(3),
ADD COLUMN     "mime_type" TEXT,
ADD COLUMN     "modelo" TEXT,
ADD COLUMN     "natureza_operacao" TEXT,
ADD COLUMN     "nome_arquivo" TEXT,
ADD COLUMN     "serie" TEXT,
ADD COLUMN     "tamanho_bytes" INTEGER,
ADD COLUMN     "tipo_arquivo" TEXT,
ADD COLUMN     "tipo_operacao" TEXT;
