-- CreateTable
CREATE TABLE "public"."CategoriaAgrupada" (
    "id" TEXT NOT NULL,
    "contaAzulCategoryId" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "CategoriaAgrupada_pkey" PRIMARY KEY ("id")
);
