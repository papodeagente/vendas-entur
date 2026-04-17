import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessaoId = Number(id);
  const body: { respostas: { perguntaId: number; resposta: boolean; severidade?: number | null }[] } =
    await req.json();

  // Upsert each answer
  for (const r of body.respostas) {
    await prisma.respostaDiagnostico.upsert({
      where: {
        sessaoId_perguntaId: { sessaoId, perguntaId: r.perguntaId },
      },
      update: { resposta: r.resposta, severidade: r.severidade ?? null },
      create: { sessaoId, perguntaId: r.perguntaId, resposta: r.resposta, severidade: r.severidade ?? null },
    });
  }

  return NextResponse.json({ ok: true });
}
