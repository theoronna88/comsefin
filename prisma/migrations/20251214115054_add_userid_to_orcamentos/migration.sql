/*
  Warnings:

  - A unique constraint covering the columns `[ano,user_id]` on the table `Orcamentos` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Orcamentos_ano_key";

-- AlterTable
ALTER TABLE "public"."Orcamentos" ADD COLUMN     "user_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Orcamentos_ano_user_id_key" ON "public"."Orcamentos"("ano", "user_id");
