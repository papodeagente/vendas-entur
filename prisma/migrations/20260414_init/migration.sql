-- CreateTable
CREATE TABLE "sessoes" (
    "id" SERIAL NOT NULL,
    "agencia_nome" TEXT NOT NULL,
    "vendedor_nome" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'rascunho',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respostas_diagnostico" (
    "id" SERIAL NOT NULL,
    "sessao_id" INTEGER NOT NULL,
    "pergunta_id" INTEGER NOT NULL,
    "resposta" BOOLEAN NOT NULL,

    CONSTRAINT "respostas_diagnostico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dados_agencia" (
    "id" SERIAL NOT NULL,
    "sessao_id" INTEGER NOT NULL,
    "vendas_mes" INTEGER NOT NULL,
    "ticket_medio" DOUBLE PRECISION NOT NULL,
    "comissao_pct" DOUBLE PRECISION NOT NULL,
    "atend_perdidos" INTEGER NOT NULL,
    "clientes_ativos" INTEGER NOT NULL,
    "clientes_inativos" INTEGER NOT NULL,
    "indicacoes_mes" INTEGER NOT NULL,
    "taxa_conversao" DOUBLE PRECISION NOT NULL,
    "tempo_recompra" INTEGER NOT NULL,
    "cpl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ticket_2a_compra" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "historico_meses" INTEGER NOT NULL DEFAULT 12,

    CONSTRAINT "dados_agencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plano_acoes" (
    "id" SERIAL NOT NULL,
    "sessao_id" INTEGER NOT NULL,
    "acao_id" INTEGER NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "concluida_em" TIMESTAMP(3),

    CONSTRAINT "plano_acoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benchmarks" (
    "id" SERIAL NOT NULL,
    "chave" TEXT NOT NULL,
    "valor_sem_entur" DOUBLE PRECISION NOT NULL,
    "valor_com_entur" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "benchmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "respostas_diagnostico_sessao_id_pergunta_id_key" ON "respostas_diagnostico"("sessao_id", "pergunta_id");

-- CreateIndex
CREATE UNIQUE INDEX "dados_agencia_sessao_id_key" ON "dados_agencia"("sessao_id");

-- CreateIndex
CREATE UNIQUE INDEX "plano_acoes_sessao_id_acao_id_key" ON "plano_acoes"("sessao_id", "acao_id");

-- CreateIndex
CREATE UNIQUE INDEX "benchmarks_chave_key" ON "benchmarks"("chave");

-- AddForeignKey
ALTER TABLE "respostas_diagnostico" ADD CONSTRAINT "respostas_diagnostico_sessao_id_fkey" FOREIGN KEY ("sessao_id") REFERENCES "sessoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dados_agencia" ADD CONSTRAINT "dados_agencia_sessao_id_fkey" FOREIGN KEY ("sessao_id") REFERENCES "sessoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_acoes" ADD CONSTRAINT "plano_acoes_sessao_id_fkey" FOREIGN KEY ("sessao_id") REFERENCES "sessoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
