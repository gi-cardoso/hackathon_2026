/*
  Warnings:

  - A unique constraint covering the columns `[id_armazem,data]` on the table `boletim_diario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "boletim_diario_id_armazem_data_key" ON "boletim_diario"("id_armazem", "data");
