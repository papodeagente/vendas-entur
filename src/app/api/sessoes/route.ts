import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessoes = await prisma.sessao.findMany({
    orderBy: { createdAt: "desc" },
    include: { dados: true, respostas: true },
  });
  return NextResponse.json(sessoes);
}

export async function POST(req: Request) {
  const body = await req.json();
  const sessao = await prisma.sessao.create({
    data: {
      agenciaNome: body.agenciaNome,
      vendedorNome: body.vendedorNome,
    },
  });
  return NextResponse.json(sessao, { status: 201 });
}
