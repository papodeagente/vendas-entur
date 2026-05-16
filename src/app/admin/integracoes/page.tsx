"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";

interface ConfigItem {
  valor?: string;
  mascarado?: string;
  existe: boolean;
}

interface Configs {
  openai_api_key: ConfigItem;
  anthropic_api_key: ConfigItem;
  ai_provider_padrao: ConfigItem;
  modelo_openai: ConfigItem;
  modelo_anthropic: ConfigItem;
}

const MODELOS_SUGERIDOS = {
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
  anthropic: [
    "claude-haiku-4-5-20251001",
    "claude-sonnet-4-6",
    "claude-opus-4-7",
  ],
};

export default function IntegracoesPage() {
  const [configs, setConfigs] = useState<Configs | null>(null);
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [providerPadrao, setProviderPadrao] = useState<"openai" | "anthropic">(
    "anthropic"
  );
  const [modeloOpenai, setModeloOpenai] = useState("gpt-4o-mini");
  const [modeloAnthropic, setModeloAnthropic] = useState(
    "claude-haiku-4-5-20251001"
  );
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState("");

  async function carregar() {
    const res = await fetch("/api/admin/configuracoes");
    if (!res.ok) return;
    const c: Configs = await res.json();
    setConfigs(c);
    if (c.ai_provider_padrao.valor === "openai" || c.ai_provider_padrao.valor === "anthropic") {
      setProviderPadrao(c.ai_provider_padrao.valor);
    }
    if (c.modelo_openai.valor) setModeloOpenai(c.modelo_openai.valor);
    if (c.modelo_anthropic.valor) setModeloAnthropic(c.modelo_anthropic.valor);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvar() {
    setSalvando(true);
    setMsg("");
    const payload: Record<string, string | null> = {
      ai_provider_padrao: providerPadrao,
      modelo_openai: modeloOpenai,
      modelo_anthropic: modeloAnthropic,
    };
    if (openaiKey.trim()) payload.openai_api_key = openaiKey.trim();
    if (anthropicKey.trim()) payload.anthropic_api_key = anthropicKey.trim();

    const res = await fetch("/api/admin/configuracoes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSalvando(false);
    if (res.ok) {
      setMsg("Configurações salvas.");
      setOpenaiKey("");
      setAnthropicKey("");
      carregar();
      setTimeout(() => setMsg(""), 3000);
    } else {
      setMsg("Erro ao salvar.");
    }
  }

  async function remover(chave: "openai_api_key" | "anthropic_api_key") {
    if (!confirm(`Remover a chave ${chave}?`)) return;
    await fetch("/api/admin/configuracoes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [chave]: null }),
    });
    carregar();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-1">Integrações de IA</h1>
        <p className="text-sm text-slate-400 mb-8">
          Configure as chaves do OpenAI e Claude para gerar SPIN personalizado por pacote.
        </p>

        {msg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-900/20 border border-emerald-800/40 text-emerald-300 text-sm">
            {msg}
          </div>
        )}

        {/* OpenAI */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">OpenAI</h2>
            {configs?.openai_api_key.existe && (
              <span className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">
                ✓ Configurada
              </span>
            )}
          </div>

          <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
            Chave API
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder={
                configs?.openai_api_key.existe
                  ? configs.openai_api_key.mascarado
                  : "sk-..."
              }
              className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {configs?.openai_api_key.existe && (
              <button
                onClick={() => remover("openai_api_key")}
                className="px-3 py-2 rounded bg-red-900/40 hover:bg-red-900/60 text-red-300 text-xs"
              >
                Remover
              </button>
            )}
          </div>

          <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
            Modelo
          </label>
          <select
            value={modeloOpenai}
            onChange={(e) => setModeloOpenai(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            {MODELOS_SUGERIDOS.openai.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Anthropic / Claude */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Anthropic (Claude)</h2>
            {configs?.anthropic_api_key.existe && (
              <span className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">
                ✓ Configurada
              </span>
            )}
          </div>

          <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
            Chave API
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="password"
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              placeholder={
                configs?.anthropic_api_key.existe
                  ? configs.anthropic_api_key.mascarado
                  : "sk-ant-..."
              }
              className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {configs?.anthropic_api_key.existe && (
              <button
                onClick={() => remover("anthropic_api_key")}
                className="px-3 py-2 rounded bg-red-900/40 hover:bg-red-900/60 text-red-300 text-xs"
              >
                Remover
              </button>
            )}
          </div>

          <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
            Modelo
          </label>
          <select
            value={modeloAnthropic}
            onChange={(e) => setModeloAnthropic(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            {MODELOS_SUGERIDOS.anthropic.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Provider padrão */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mb-5">
          <h2 className="text-lg font-semibold text-white mb-3">
            Provider padrão
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Qual provedor usar quando gerar SPIN para um novo pacote.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setProviderPadrao("openai")}
              className={`p-4 rounded-lg border transition ${
                providerPadrao === "openai"
                  ? "bg-emerald-900/20 border-emerald-700 text-emerald-200"
                  : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600"
              }`}
            >
              <p className="font-semibold">OpenAI</p>
              <p className="text-xs opacity-70">{modeloOpenai}</p>
            </button>
            <button
              onClick={() => setProviderPadrao("anthropic")}
              className={`p-4 rounded-lg border transition ${
                providerPadrao === "anthropic"
                  ? "bg-emerald-900/20 border-emerald-700 text-emerald-200"
                  : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600"
              }`}
            >
              <p className="font-semibold">Claude (Anthropic)</p>
              <p className="text-xs opacity-70">{modeloAnthropic}</p>
            </button>
          </div>
        </div>

        <button
          onClick={salvar}
          disabled={salvando}
          className="w-full px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold"
        >
          {salvando ? "Salvando..." : "Salvar configurações"}
        </button>

        <p className="text-[11px] text-slate-600 text-center mt-4">
          Chaves são armazenadas no banco e nunca expostas via API. Apenas o
          super admin acessa essa página.
        </p>
      </div>
    </div>
  );
}
