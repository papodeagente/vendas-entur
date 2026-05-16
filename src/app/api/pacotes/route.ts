import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verificarSessao, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function userId() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const s = await verificarSessao(token);
  return s?.userId ?? null;
}

export async function GET() {
  const pacotes = await prisma.pacote.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { nome: true, email: true } } },
  });
  return NextResponse.json(pacotes);
}

export async function POST(req: Request) {
  const uid = await userId();
  if (!uid) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const obrigatorios = [
    "nome",
    "destino",
    "tipo",
    "duracaoDias",
    "valorTotal",
    "personaAlvo",
    "descricao",
  ];
  for (const f of obrigatorios) {
    if (!body[f] && body[f] !== 0) {
      return NextResponse.json(
        { error: `Campo obrigatório ausente: ${f}` },
        { status: 400 }
      );
    }
  }

  const pacote = await prisma.pacote.create({
    data: {
      nome: String(body.nome).trim(),
      destino: String(body.destino).trim(),
      tipo: String(body.tipo).trim(),
      duracaoDias: Number(body.duracaoDias),
      valorTotal: Number(body.valorTotal),
      moeda: body.moeda ? String(body.moeda) : "BRL",
      personaAlvo: String(body.personaAlvo).trim(),
      descricao: String(body.descricao).trim(),
      diferenciais: body.diferenciais ? String(body.diferenciais).trim() : null,
      objecoesComuns: body.objecoesComuns
        ? String(body.objecoesComuns).trim()
        : null,
      observacoes: body.observacoes ? String(body.observacoes).trim() : null,
      createdById: uid,
    },
  });
  return NextResponse.json(pacote, { status: 201 });
}
