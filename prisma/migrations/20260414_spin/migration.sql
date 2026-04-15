-- CreateTable
CREATE TABLE "prospects" (
    "id" SERIAL NOT NULL,
    "sessao_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT,
    "tamanho_equipe" INTEGER,
    "email" TEXT,
    "whatsapp" TEXT,

    CONSTRAINT "prospects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frases_cliente" (
    "id" SERIAL NOT NULL,
    "sessao_id" INTEGER NOT NULL,
    "fase" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "pergunta_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "frases_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progresso_fases" (
    "id" SERIAL NOT NULL,
    "sessao_id" INTEGER NOT NULL,
    "fase" TEXT NOT NULL,
    "iniciada_em" TIMESTAMP(3),
    "concluida_em" TIMESTAMP(3),

    CONSTRAINT "progresso_fases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prospects_sessao_id_key" ON "prospects"("sessao_id");

-- CreateIndex
CREATE UNIQUE INDEX "progresso_fases_sessao_id_fase_key" ON "progresso_fases"("sessao_id", "fase");

-- AddForeignKey
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_sessao_id_fkey" FOREIGN KEY ("sessao_id") REFERENCES "sessoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frases_cliente" ADD CONSTRAINT "frases_cliente_sessao_id_fkey" FOREIGN KEY ("sessao_id") REFERENCES "sessoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso_fases" ADD CONSTRAINT "progresso_fases_sessao_id_fkey" FOREIGN KEY ("sessao_id") REFERENCES "sessoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
