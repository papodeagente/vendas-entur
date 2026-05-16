import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const pacote = await prisma.pacote.findUnique({
    where: { id: Number(id) },
    include: { createdBy: { select: { nome: true, email: true } } },
  });
  if (!pacote) {
    return NextResponse.json({ error: "Pacote não encontrado" }, { status: 404 });
  }
  return NextResponse.json(pacote);
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (typeof body.nome === "string") data.nome = body.nome.trim();
  if (typeof body.destino === "string") data.destino = body.destino.trim();
  if (typeof body.tipo === "string") data.tipo = body.tipo.trim();
  if (body.duracaoDias != null) data.duracaoDias = Number(body.duracaoDias);
  if (body.valorTotal != null) data.valorTotal = Number(body.valorTotal);
  if (typeof body.moeda === "string") data.moeda = body.moeda;
  if (typeof body.personaAlvo === "string")
    data.personaAlvo = body.personaAlvo.trim();
  if (typeof body.descricao === "string")
    data.descricao = body.descricao.trim();
  if (body.diferenciais !== undefined)
    data.diferenciais = body.diferenciais ? String(body.diferenciais).trim() : null;
  if (body.objecoesComuns !== undefined)
    data.objecoesComuns = body.objecoesComuns
      ? String(body.objecoesComuns).trim()
      : null;
  if (body.observacoes !== undefined)
    data.observacoes = body.observacoes ? String(body.observacoes).trim() : null;

  const pacote = await prisma.pacote.update({
    where: { id: Number(id) },
    data,
  });
  return NextResponse.json(pacote);
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  await prisma.pacote.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
