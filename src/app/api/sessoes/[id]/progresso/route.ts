import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const sessaoId = Number(id);
  const fase = body.fase as string;
  const acao = body.acao as "iniciar" | "concluir";

  const now = new Date();
  const existing = await prisma.progressoFase.findUnique({
    where: { sessaoId_fase: { sessaoId, fase } },
  });

  if (!existing) {
    const data = {
      sessaoId,
      fase,
      iniciadaEm: acao === "iniciar" || acao === "concluir" ? now : null,
      concluidaEm: acao === "concluir" ? now : null,
    };
    const created = await prisma.progressoFase.create({ data });
    return NextResponse.json(created);
  }

  const updated = await prisma.progressoFase.update({
    where: { sessaoId_fase: { sessaoId, fase } },
    data: {
      iniciadaEm: existing.iniciadaEm ?? now,
      concluidaEm: acao === "concluir" ? now : existing.concluidaEm,
    },
  });
  return NextResponse.json(updated);
}
