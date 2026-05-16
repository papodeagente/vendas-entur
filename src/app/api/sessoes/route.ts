import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verificarSessao } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function sessaoAtual() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verificarSessao(token);
}

export async function GET() {
  const s = await sessaoAtual();
  if (!s) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const sessoes = await prisma.sessao.findMany({
    where: s.role === "admin" ? undefined : { userId: s.userId },
    orderBy: { createdAt: "desc" },
    include: { dados: true, respostas: true, usuario: { select: { id: true, nome: true, email: true } } },
  });
  return NextResponse.json(sessoes);
}

export async function POST(req: Request) {
  const s = await sessaoAtual();
  if (!s) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const sessao = await prisma.sessao.create({
    data: {
      userId: s.userId,
      agenciaNome: body.agenciaNome,
      vendedorNome: s.nome,
    },
  });
  return NextResponse.json(sessao, { status: 201 });
}
