import { prisma } from "./prisma";

export type ChaveConfig =
  | "openai_api_key"
  | "anthropic_api_key"
  | "ai_provider_padrao"
  | "modelo_openai"
  | "modelo_anthropic";

export const PROVIDERS_VALIDOS = ["openai", "anthropic"] as const;
export type Provider = (typeof PROVIDERS_VALIDOS)[number];

export const MODELOS_PADRAO = {
  openai: "gpt-4o-mini",
  anthropic: "claude-haiku-4-5-20251001",
};

export async function getConfig(chave: ChaveConfig): Promise<string | null> {
  const config = await prisma.configuracao.findUnique({ where: { chave } });
  return config?.valor ?? null;
}

export async function setConfig(chave: ChaveConfig, valor: string) {
  return prisma.configuracao.upsert({
    where: { chave },
    update: { valor },
    create: { chave, valor },
  });
}

export async function deleteConfig(chave: ChaveConfig) {
  return prisma.configuracao
    .delete({ where: { chave } })
    .catch(() => null);
}

export async function getAllConfigs(): Promise<Record<string, string>> {
  const list = await prisma.configuracao.findMany();
  return Object.fromEntries(list.map((c) => [c.chave, c.valor]));
}

// Mascara chave para exibição (mostra só primeiros/últimos 4 chars)
export function mascararChave(valor: string): string {
  if (!valor || valor.length < 12) return "•".repeat(8);
  return `${valor.slice(0, 4)}${"•".repeat(Math.max(8, valor.length - 12))}${valor.slice(-4)}`;
}

export async function getProviderPadrao(): Promise<Provider> {
  const valor = await getConfig("ai_provider_padrao");
  if (valor === "openai" || valor === "anthropic") return valor;
  // fallback: usar o que tiver chave configurada
  const openaiKey = await getConfig("openai_api_key");
  if (openaiKey) return "openai";
  const anthropicKey = await getConfig("anthropic_api_key");
  if (anthropicKey) return "anthropic";
  return "anthropic";
}
