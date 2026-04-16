import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      nome: true,
      role: true,
      ativo: true,
      createdAt: true,
    },
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const { email, nome, password, role } = await req.json();

  if (!email || !nome || !password) {
    return NextResponse.json(
      { error: "email, nome e password são obrigatórios" },
      { status: 400 }
    );
  }
  if (String(password).length < 8) {
    return NextResponse.json(
      { error: "Senha precisa ter ao menos 8 caracteres" },
      { status: 400 }
    );
  }

  const emailNorm = String(email).toLowerCase().trim();
  const existente = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (existente) {
    return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: emailNorm,
      nome: String(nome).trim(),
      passwordHash,
      role: role === "admin" ? "admin" : "user",
      ativo: true,
    },
    select: { id: true, email: true, nome: true, role: true, ativo: true, createdAt: true },
  });
  return NextResponse.json(user, { status: 201 });
}
