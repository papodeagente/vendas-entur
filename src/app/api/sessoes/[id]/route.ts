import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessao = await prisma.sessao.findUnique({
    where: { id: Number(id) },
    include: { respostas: true, dados: true, planoAcoes: true, prospect: true, frases: true, progresso: true },
  });
  if (!sessao) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  return NextResponse.json(sessao);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.sessao.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
