import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verificarSessao } from "@/lib/auth";
import { MODELO_INTERNO_ENTUR } from "@/lib/modelosSpin";

export const dynamic = "force-dynamic";

async function sessaoAtual() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verificarSessao(token);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const s = await sessaoAtual();
  if (!s) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const sessao = await prisma.sessao.findUnique({
    where: { id: Number(id) },
    include: {
      respostas: true,
      dados: true,
      planoAcoes: true,
      prospect: true,
      frases: true,
      progresso: true,
      usuario: { select: { id: true, nome: true, email: true } },
      pacote: {
        select: {
          id: true,
          nome: true,
          destino: true,
          valorTotal: true,
          moeda: true,
        },
      },
    },
  });
  if (!sessao) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  if (
    s.role !== "admin" &&
    (sessao.userId !== s.userId || sessao.modeloSpin === MODELO_INTERNO_ENTUR)
  ) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  return NextResponse.json(sessao);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const s = await sessaoAtual();
  if (!s) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const sessao = await prisma.sessao.findUnique({ where: { id: Number(id) } });
  if (!sessao) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  if (
    s.role !== "admin" &&
    (sessao.userId !== s.userId || sessao.modeloSpin === MODELO_INTERNO_ENTUR)
  ) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  await prisma.sessao.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
