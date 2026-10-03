-- Prevents storing more than one invoice with the same access key.
CREATE UNIQUE INDEX "nota_fiscal_chave_acesso_key" ON "nota_fiscal"("chave_acesso");
