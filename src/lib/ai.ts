import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import {
  getConfig,
  getProviderPadrao,
  MODELOS_PADRAO,
  type Provider,
} from "./configuracoes";

export interface GerarOpcoes {
  prompt: string;
  systemPrompt?: string;
  provider?: Provider; // override
  maxTokens?: number;
  temperature?: number;
}

export interface GerarResultado {
  texto: string;
  provider: Provider;
  modelo: string;
}

/**
 * Gera texto via OpenAI ou Claude, usando provider padrão configurado ou override.
 */
export async function gerarTexto(opcoes: GerarOpcoes): Promise<GerarResultado> {
  const provider = opcoes.provider ?? (await getProviderPadrao());

  if (provider === "openai") {
    const key = await getConfig("openai_api_key");
    if (!key) {
      throw new Error(
        "Chave OpenAI não configurada. Configure em /admin/integracoes."
      );
    }
    const modeloCustom = await getConfig("modelo_openai");
    const modelo = modeloCustom || MODELOS_PADRAO.openai;
    const client = new OpenAI({ apiKey: key });
    const resp = await client.chat.completions.create({
      model: modelo,
      messages: [
        ...(opcoes.systemPrompt
          ? [{ role: "system" as const, content: opcoes.systemPrompt }]
          : []),
        { role: "user" as const, content: opcoes.prompt },
      ],
      max_completion_tokens: opcoes.maxTokens ?? 4096,
      temperature: opcoes.temperature ?? 0.7,
    });
    const texto = resp.choices[0]?.message?.content ?? "";
    return { texto, provider: "openai", modelo };
  }

  // anthropic
  const key = await getConfig("anthropic_api_key");
  if (!key) {
    throw new Error(
      "Chave Anthropic (Claude) não configurada. Configure em /admin/integracoes."
    );
  }
  const modeloCustom = await getConfig("modelo_anthropic");
  const modelo = modeloCustom || MODELOS_PADRAO.anthropic;
  const client = new Anthropic({ apiKey: key });
  const resp = await client.messages.create({
    model: modelo,
    max_tokens: opcoes.maxTokens ?? 4096,
    temperature: opcoes.temperature ?? 0.7,
    system: opcoes.systemPrompt,
    messages: [{ role: "user", content: opcoes.prompt }],
  });
  const bloco = resp.content[0];
  const texto = bloco && bloco.type === "text" ? bloco.text : "";
  return { texto, provider: "anthropic", modelo };
}

/**
 * Tenta extrair JSON de uma resposta de IA (lida com fences markdown).
 */
export function extrairJSON<T = unknown>(texto: string): T | null {
  const limpo = texto
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  // tenta o texto inteiro
  try {
    return JSON.parse(limpo) as T;
  } catch {}

  // tenta encontrar o primeiro objeto JSON
  const match = limpo.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]) as T;
    } catch {}
  }
  return null;
}
