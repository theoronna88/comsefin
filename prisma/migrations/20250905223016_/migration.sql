/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `ItensOrcamento` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."ValoresOrcamento_orcamentoId_itemId_key";

-- AlterTable
ALTER TABLE "public"."ValoresOrcamento" ADD CONSTRAINT "ValoresOrcamento_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "ItensOrcamento_codigo_key" ON "public"."ItensOrcamento"("codigo");
