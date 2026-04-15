import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const sessaoId = Number(id);
  const data = {
    nome: body.nome ?? "",
    cargo: body.cargo ?? null,
    tamanhoEquipe: body.tamanhoEquipe != null ? Number(body.tamanhoEquipe) : null,
    email: body.email ?? null,
    whatsapp: body.whatsapp ?? null,
  };
  const prospect = await prisma.prospect.upsert({
    where: { sessaoId },
    update: data,
    create: { sessaoId, ...data },
  });
  return NextResponse.json(prospect);
}
