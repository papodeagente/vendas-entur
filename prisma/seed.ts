import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Benchmarks do documento
  const benchmarks = [
    {
      chave: "taxa_recuperacao",
      valorSemEntur: 0,
      valorComEntur: 0.30,
      descricao: "Taxa de recuperação de atendimentos perdidos",
    },
    {
      chave: "taxa_recompra",
      valorSemEntur: 0.01,
      valorComEntur: 0.08,
      descricao: "Taxa de recompra mensal de clientes ativos",
    },
    {
      chave: "taxa_reativacao",
      valorSemEntur: 0,
      valorComEntur: 0.05,
      descricao: "Taxa de reativação de inativos (90 dias)",
    },
    {
      chave: "indicacoes_por_ativo_ano",
      valorSemEntur: 0.2,
      valorComEntur: 1.0,
      descricao: "Indicações geradas por cliente ativo por ano",
    },
    {
      chave: "conversao_indicacao",
      valorSemEntur: 0.25,
      valorComEntur: 0.45,
      descricao: "Taxa de conversão de indicações",
    },
    {
      chave: "taxa_conversao_geral",
      valorSemEntur: 0.08,
      valorComEntur: 0.22,
      descricao: "Taxa de conversão geral de leads",
    },
  ];

  for (const b of benchmarks) {
    await prisma.benchmark.upsert({
      where: { chave: b.chave },
      update: b,
      create: b,
    });
  }

  console.log(`✓ ${benchmarks.length} benchmarks criados`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
