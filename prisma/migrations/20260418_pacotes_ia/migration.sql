-- CreateTable: configuracoes
CREATE TABLE "configuracoes" (
    "id" SERIAL NOT NULL,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "configuracoes_chave_key" ON "configuracoes"("chave");

-- CreateTable: pacotes
CREATE TABLE "pacotes" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "duracao_dias" INTEGER NOT NULL,
    "valor_total" DOUBLE PRECISION NOT NULL,
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "persona_alvo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "diferenciais" TEXT,
    "objecoes_comuns" TEXT,
    "observacoes" TEXT,
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pacotes_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "pacotes" ADD CONSTRAINT "pacotes_created_by_id_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AlterTable: sessoes
ALTER TABLE "sessoes" ADD COLUMN "pacote_id" INTEGER;
ALTER TABLE "sessoes" ADD COLUMN "perguntas_json" TEXT;

ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_pacote_id_fkey"
    FOREIGN KEY ("pacote_id") REFERENCES "pacotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
