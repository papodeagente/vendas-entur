ALTER TABLE "sessoes"
ADD COLUMN "user_id" INTEGER,
ADD COLUMN "comercial_status" TEXT NOT NULL DEFAULT 'nova',
ADD COLUMN "cta_escolhido" TEXT,
ADD COLUMN "preco_crm_mes" DOUBLE PRECISION,
ADD COLUMN "valor_mesa_mes" DOUBLE PRECISION,
ADD COLUMN "valor_mesa_ano" DOUBLE PRECISION,
ADD COLUMN "follow_up_em" TIMESTAMP(3),
ADD COLUMN "observacao_fechamento" TEXT;

ALTER TABLE "sessoes"
ADD CONSTRAINT "sessoes_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "sessoes_user_id_idx" ON "sessoes"("user_id");
CREATE INDEX "sessoes_comercial_status_idx" ON "sessoes"("comercial_status");
CREATE INDEX "sessoes_follow_up_em_idx" ON "sessoes"("follow_up_em");
