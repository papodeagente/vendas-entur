import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  nova: "Nova",
  diagnostico: "Diagnóstico",
  demo: "Demo",
  proposta: "Proposta",
  piloto: "Piloto",
  negociacao: "Negociação",
  ganho: "Ganho",
  perdido: "Perdido",
};

export async function GET() {
  const sessoes = await prisma.sessao.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      usuario: { select: { id: true, nome: true, email: true } },
      prospect: true,
      dados: true,
      respostas: true,
      progresso: true,
    },
  });

  const porStatus = Object.entries(STATUS_LABELS).map(([key, label]) => ({
    key,
    label,
    total: sessoes.filter((s) => s.comercialStatus === key).length,
  }));

  const porVendedorMap = new Map<
    string,
    { vendedor: string; email: string | null; sessoes: number; valorMesaMes: number; ganhas: number; propostas: number }
  >();

  for (const s of sessoes) {
    const key = s.usuario?.email || s.vendedorNome || "sem-vendedor";
    const atual =
      porVendedorMap.get(key) ||
      {
        vendedor: s.usuario?.nome || s.vendedorNome || "Sem vendedor",
        email: s.usuario?.email || null,
        sessoes: 0,
        valorMesaMes: 0,
        ganhas: 0,
        propostas: 0,
      };
    atual.sessoes += 1;
    atual.valorMesaMes += s.valorMesaMes || 0;
    if (s.comercialStatus === "ganho") atual.ganhas += 1;
    if (["proposta", "negociacao", "ganho"].includes(s.comercialStatus)) atual.propostas += 1;
    porVendedorMap.set(key, atual);
  }

  const totalValorMesaMes = sessoes.reduce((acc, s) => acc + (s.valorMesaMes || 0), 0);
  const completas = sessoes.filter((s) => s.status === "completa").length;
  const comCta = sessoes.filter((s) => !!s.ctaEscolhido).length;
  const ganhas = sessoes.filter((s) => s.comercialStatus === "ganho").length;
  const perdidas = sessoes.filter((s) => s.comercialStatus === "perdido").length;

  const recentes = sessoes.slice(0, 12).map((s) => ({
    id: s.id,
    agenciaNome: s.agenciaNome,
    vendedorNome: s.usuario?.nome || s.vendedorNome,
    prospectNome: s.prospect?.nome || null,
    comercialStatus: s.comercialStatus,
    ctaEscolhido: s.ctaEscolhido,
    valorMesaMes: s.valorMesaMes,
    followUpEm: s.followUpEm,
    createdAt: s.createdAt,
  }));

  return NextResponse.json({
    resumo: {
      sessoes: sessoes.length,
      completas,
      comCta,
      ganhas,
      perdidas,
      totalValorMesaMes,
      ticketMedioMesa: sessoes.length ? totalValorMesaMes / sessoes.length : 0,
    },
    porStatus,
    porVendedor: Array.from(porVendedorMap.values()).sort((a, b) => b.sessoes - a.sessoes),
    recentes,
  });
}
