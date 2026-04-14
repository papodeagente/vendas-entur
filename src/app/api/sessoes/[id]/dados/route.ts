import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessaoId = Number(id);
  const body = await req.json();

  const dados = await prisma.dadosAgencia.upsert({
    where: { sessaoId },
    update: {
      vendasMes: body.vendasMes,
      ticketMedio: body.ticketMedio,
      comissaoPct: body.comissaoPct,
      atendPerdidos: body.atendPerdidos,
      clientesAtivos: body.clientesAtivos,
      clientesInativos: body.clientesInativos,
      indicacoesMes: body.indicacoesMes,
      taxaConversao: body.taxaConversao,
      tempoRecompra: body.tempoRecompra,
      cpl: body.cpl || 0,
      ticket2aCompra: body.ticket2aCompra || 0,
      historicoMeses: body.historicoMeses || 12,
    },
    create: {
      sessaoId,
      vendasMes: body.vendasMes,
      ticketMedio: body.ticketMedio,
      comissaoPct: body.comissaoPct,
      atendPerdidos: body.atendPerdidos,
      clientesAtivos: body.clientesAtivos,
      clientesInativos: body.clientesInativos,
      indicacoesMes: body.indicacoesMes,
      taxaConversao: body.taxaConversao,
      tempoRecompra: body.tempoRecompra,
      cpl: body.cpl || 0,
      ticket2aCompra: body.ticket2aCompra || 0,
      historicoMeses: body.historicoMeses || 12,
    },
  });

  return NextResponse.json(dados);
}
