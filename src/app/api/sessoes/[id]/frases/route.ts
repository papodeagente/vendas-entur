import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const frase = await prisma.fraseCliente.create({
    data: {
      sessaoId: Number(id),
      fase: body.fase,
      texto: body.texto,
      perguntaId: body.perguntaId ?? null,
    },
  });
  return NextResponse.json(frase);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const fraseId = Number(searchParams.get("fraseId"));
  await prisma.fraseCliente.delete({
    where: { id: fraseId, sessaoId: Number(id) },
  });
  return NextResponse.json({ ok: true });
}
