import { NextResponse } from "next/server";
import {
  ChaveConfig,
  getAllConfigs,
  setConfig,
  deleteConfig,
  mascararChave,
} from "@/lib/configuracoes";

export const dynamic = "force-dynamic";

const CHAVES_SECRETAS: ChaveConfig[] = ["openai_api_key", "anthropic_api_key"];
const CHAVES_PUBLICAS: ChaveConfig[] = [
  "ai_provider_padrao",
  "modelo_openai",
  "modelo_anthropic",
];

export async function GET() {
  const configs = await getAllConfigs();
  const visivel: Record<string, { valor?: string; mascarado?: string; existe: boolean }> = {};

  for (const c of CHAVES_SECRETAS) {
    const v = configs[c];
    visivel[c] = v
      ? { mascarado: mascararChave(v), existe: true }
      : { existe: false };
  }
  for (const c of CHAVES_PUBLICAS) {
    const v = configs[c];
    visivel[c] = v ? { valor: v, existe: true } : { existe: false };
  }
  return NextResponse.json(visivel);
}

export async function PUT(req: Request) {
  const body: Record<string, string | null> = await req.json();
  const validas: ChaveConfig[] = [...CHAVES_SECRETAS, ...CHAVES_PUBLICAS];

  for (const [chave, valor] of Object.entries(body)) {
    if (!validas.includes(chave as ChaveConfig)) continue;
    if (valor === null || valor === "") {
      await deleteConfig(chave as ChaveConfig);
    } else {
      await setConfig(chave as ChaveConfig, valor);
    }
  }
  return NextResponse.json({ ok: true });
}
