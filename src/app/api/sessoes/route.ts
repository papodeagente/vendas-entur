import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verificarSessao } from "@/lib/auth";
import {
  MODELO_INTERNO_ENTUR,
  normalizarModeloSpin,
} from "@/lib/modelosSpin";

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
    where:
      s.role === "admin"
        ? undefined
        : { userId: s.userId, modeloSpin: { not: MODELO_INTERNO_ENTUR } },
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
  const agenciaNome = String(body.agenciaNome || "").trim();
  if (!agenciaNome) {
    return NextResponse.json(
      { error: "Nome da agência é obrigatório" },
      { status: 400 }
    );
  }

  const modeloSpin = normalizarModeloSpin(body.modeloSpin);
  if (modeloSpin === MODELO_INTERNO_ENTUR && s.role !== "admin") {
    return NextResponse.json(
      { error: "Modelo interno disponível apenas para usuários autorizados" },
      { status: 403 }
    );
  }

  const sessao = await prisma.sessao.create({
    data: {
      userId: s.userId,
      modeloSpin,
      agenciaNome,
      vendedorNome: s.nome,
    },
  });
  return NextResponse.json(sessao, { status: 201 });
}
