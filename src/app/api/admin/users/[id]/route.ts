import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, verificarSessao, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function sessaoAtual() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verificarSessao(token);
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const userId = Number(id);
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (typeof body.nome === "string") data.nome = body.nome.trim();
  if (body.role === "admin" || body.role === "user") data.role = body.role;
  if (typeof body.ativo === "boolean") data.ativo = body.ativo;
  if (typeof body.password === "string" && body.password.length > 0) {
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: "Senha precisa ter ao menos 8 caracteres" },
        { status: 400 }
      );
    }
    data.passwordHash = await hashPassword(body.password);
  }

  const atual = await prisma.user.findUnique({ where: { id: userId } });
  if (!atual) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const s = await sessaoAtual();
  if (s?.userId === userId && (data.ativo === false || data.role === "user")) {
    return NextResponse.json(
      { error: "Não é possível rebaixar ou desativar você mesmo" },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, nome: true, role: true, ativo: true, createdAt: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const userId = Number(id);
  const s = await sessaoAtual();
  if (s?.userId === userId) {
    return NextResponse.json({ error: "Não é possível excluir você mesmo" }, { status: 400 });
  }
  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
