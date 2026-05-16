import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verificarSessao } from "@/lib/auth";

export const dynamic = "force-dynamic";

const STATUS_VALIDOS = new Set([
  "nova",
  "diagnostico",
  "demo",
  "proposta",
  "piloto",
  "negociacao",
  "ganho",
  "perdido",
]);

const CTAS_VALIDOS = new Set(["demo", "proposta", "piloto"]);

async function sessaoAtual() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verificarSessao(token);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessaoId = Number(id);
  const s = await sessaoAtual();
  if (!s) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const atual = await prisma.sessao.findUnique({ where: { id: sessaoId } });
  if (!atual) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
  }
  if (s.role !== "admin" && atual.userId !== s.userId) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = await req.json();
  const data: {
    comercialStatus?: string;
    ctaEscolhido?: string | null;
    precoCrmMes?: number | null;
    valorMesaMes?: number | null;
    valorMesaAno?: number | null;
    followUpEm?: Date | null;
    observacaoFechamento?: string | null;
    status?: string;
  } = {};

  if (typeof body.comercialStatus === "string") {
    if (!STATUS_VALIDOS.has(body.comercialStatus)) {
      return NextResponse.json({ error: "Status comercial inválido" }, { status: 400 });
    }
    data.comercialStatus = body.comercialStatus;
  }

  if (body.ctaEscolhido === null) data.ctaEscolhido = null;
  if (typeof body.ctaEscolhido === "string") {
    if (!CTAS_VALIDOS.has(body.ctaEscolhido)) {
      return NextResponse.json({ error: "CTA inválido" }, { status: 400 });
    }
    data.ctaEscolhido = body.ctaEscolhido;
  }

  if (body.precoCrmMes !== undefined) data.precoCrmMes = Number(body.precoCrmMes) || null;
  if (body.valorMesaMes !== undefined) data.valorMesaMes = Number(body.valorMesaMes) || null;
  if (body.valorMesaAno !== undefined) data.valorMesaAno = Number(body.valorMesaAno) || null;
  if (body.followUpEm !== undefined) {
    data.followUpEm = body.followUpEm ? new Date(body.followUpEm) : null;
  }
  if (body.observacaoFechamento !== undefined) {
    data.observacaoFechamento = body.observacaoFechamento
      ? String(body.observacaoFechamento).trim()
      : null;
  }
  if (data.comercialStatus && ["demo", "proposta", "piloto", "negociacao", "ganho"].includes(data.comercialStatus)) {
    data.status = "completa";
  }

  const sessao = await prisma.sessao.update({
    where: { id: sessaoId },
    data,
    include: {
      usuario: { select: { id: true, nome: true, email: true } },
      prospect: true,
      dados: true,
      respostas: true,
    },
  });

  return NextResponse.json(sessao);
}
