import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gerarSpinParaPacote } from "@/lib/spinGerador";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST { pacoteId, sessaoId?, force? }
 * Gera o SPIN customizado via IA e (se sessaoId) salva em sessoes.perguntas_json.
 */
export async function POST(req: Request) {
  const { pacoteId, sessaoId, force } = await req.json();

  if (!pacoteId) {
    return NextResponse.json({ error: "pacoteId obrigatório" }, { status: 400 });
  }

  const pacote = await prisma.pacote.findUnique({
    where: { id: Number(pacoteId) },
  });
  if (!pacote) {
    return NextResponse.json({ error: "Pacote não encontrado" }, { status: 404 });
  }

  // Se a sessão já tem JSON e não foi forçada regeração, retorna cache
  if (sessaoId && !force) {
    const sessao = await prisma.sessao.findUnique({
      where: { id: Number(sessaoId) },
    });
    if (sessao?.perguntasJson) {
      try {
        return NextResponse.json({
          spin: JSON.parse(sessao.perguntasJson),
          cached: true,
        });
      } catch {
        // JSON inválido, regenera
      }
    }
  }

  try {
    const { spin, provider, modelo } = await gerarSpinParaPacote({
      nome: pacote.nome,
      destino: pacote.destino,
      tipo: pacote.tipo,
      duracaoDias: pacote.duracaoDias,
      valorTotal: pacote.valorTotal,
      moeda: pacote.moeda,
      personaAlvo: pacote.personaAlvo,
      descricao: pacote.descricao,
      diferenciais: pacote.diferenciais,
      objecoesComuns: pacote.objecoesComuns,
    });

    if (sessaoId) {
      await prisma.sessao.update({
        where: { id: Number(sessaoId) },
        data: { perguntasJson: JSON.stringify(spin) },
      });
    }

    return NextResponse.json({ spin, provider, modelo, cached: false });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
