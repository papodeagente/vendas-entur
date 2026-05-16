ALTER TABLE "sessoes"
ADD COLUMN "modelo_spin" TEXT NOT NULL DEFAULT 'entur_crm_interno';

CREATE INDEX "sessoes_modelo_spin_idx" ON "sessoes"("modelo_spin");
