import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyPassword, assinarSessao, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "E-mail e senha obrigatórios" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase().trim() },
  });

  if (!user || !user.ativo) {
    return NextResponse.json(
      { error: "Credenciais inválidas" },
      { status: 401 }
    );
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Credenciais inválidas" },
      { status: 401 }
    );
  }

  const token = await assinarSessao({
    userId: user.id,
    email: user.email,
    nome: user.nome,
    role: user.role as "admin" | "user",
  });

  const res = NextResponse.json({
    id: user.id,
    email: user.email,
    nome: user.nome,
    role: user.role,
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
