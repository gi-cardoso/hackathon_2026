-- AlterTable
ALTER TABLE "item_boletim" ADD COLUMN     "qtd_descarga" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "qtd_remocao" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "qtd_transferencia" DECIMAL(65,30) NOT NULL DEFAULT 0;
