"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import type { SpinGerado } from "@/lib/spinGerador";

interface Pacote {
  id: number;
  nome: string;
  destino: string;
  tipo: string;
  duracaoDias: number;
  valorTotal: number;
  moeda: string;
  personaAlvo: string;
  descricao: string;
  diferenciais: string | null;
  objecoesComuns: string | null;
  createdBy: { nome: string };
}

function brl(n: number, moeda: string) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: moeda || "BRL",
    maximumFractionDigits: 0,
  });
}

export default function PacoteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [pacote, setPacote] = useState<Pacote | null>(null);
  const [spin, setSpin] = useState<SpinGerado | null>(null);
  const [gerando, setGerando] = useState(false);
  const [iniciandoSessao, setIniciandoSessao] = useState(false);
  const [erro, setErro] = useState("");
  const [providerUsado, setProviderUsado] = useState("");

  useEffect(() => {
    fetch(`/api/pacotes/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setPacote);
  }, [id]);

  async function gerarSpin() {
    setGerando(true);
    setErro("");
    const res = await fetch("/api/spin-gerador", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pacoteId: Number(id) }),
    });
    setGerando(false);
    if (!res.ok) {
      const d = await res.json();
      setErro(d.error || "Erro ao gerar SPIN");
      return;
    }
    const data = await res.json();
    setSpin(data.spin);
    if (data.provider) setProviderUsado(`${data.provider} (${data.modelo})`);
  }

  async function iniciarSessao() {
    setIniciandoSessao(true);
    setErro("");
    const res = await fetch("/api/sessoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agenciaNome: pacote?.destino || "Atendimento",
        modeloSpin: "agencia_buenos_aires",
        pacoteId: Number(id),
        perguntasJson: JSON.stringify(spin),
      }),
    });
    setIniciandoSessao(false);
    if (!res.ok) {
      const d = await res.json();
      setErro(d.error || "Erro ao iniciar sessão");
      return;
    }
    const sessao = await res.json();
    router.push(`/sessao/${sessao.id}/ao-vivo`);
  }

  async function excluir() {
    if (!confirm("Excluir este pacote? As sessões já criadas continuarão funcionando.")) return;
    await fetch(`/api/pacotes/${id}`, { method: "DELETE" });
    router.push("/pacotes");
  }

  if (!pacote) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="max-w-3xl mx-auto p-10 text-slate-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link
          href="/pacotes"
          className="text-xs text-slate-400 hover:text-white"
        >
          ← Todos os pacotes
        </Link>

        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{pacote.nome}</h1>
            <p className="text-slate-400 mt-1">{pacote.destino}</p>
          </div>
          <button
            onClick={excluir}
            className="text-xs text-slate-500 hover:text-red-400"
          >
            Excluir
          </button>
        </div>

        {/* Dados do pacote */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <p className="text-[10px] uppercase text-slate-500">Tipo</p>
            <p className="text-sm text-slate-200 capitalize">{pacote.tipo}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <p className="text-[10px] uppercase text-slate-500">Duração</p>
            <p className="text-sm text-slate-200">{pacote.duracaoDias} dias</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <p className="text-[10px] uppercase text-slate-500">Valor</p>
            <p className="text-sm text-emerald-300 font-semibold">
              {brl(pacote.valorTotal, pacote.moeda)}
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <p className="text-[10px] uppercase text-slate-500">Cadastrado por</p>
            <p className="text-sm text-slate-200">{pacote.createdBy.nome}</p>
          </div>
        </div>

        <div className="mt-5 bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <p className="text-[10px] uppercase text-slate-500 mb-1">Persona alvo</p>
          <p className="text-sm text-slate-200 mb-4">{pacote.personaAlvo}</p>

          <p className="text-[10px] uppercase text-slate-500 mb-1">Descrição</p>
          <p className="text-sm text-slate-200 whitespace-pre-line mb-4">
            {pacote.descricao}
          </p>

          {pacote.diferenciais && (
            <>
              <p className="text-[10px] uppercase text-slate-500 mb-1">Diferenciais</p>
              <p className="text-sm text-slate-300 whitespace-pre-line mb-4">
                {pacote.diferenciais}
              </p>
            </>
          )}

          {pacote.objecoesComuns && (
            <>
              <p className="text-[10px] uppercase text-slate-500 mb-1">Objeções comuns</p>
              <p className="text-sm text-slate-300 whitespace-pre-line">
                {pacote.objecoesComuns}
              </p>
            </>
          )}
        </div>

        {/* Gerar SPIN */}
        <div className="mt-6 bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-700/40 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-2">
            ✨ Gerar SPIN personalizado via IA
          </h2>
          <p className="text-sm text-slate-300 mb-4">
            A IA vai gerar todas as perguntas SPIN (Situação, Problema, Implicação,
            Need-Payoff), pilares de curadoria e frases de fechamento, baseado nas
            informações deste pacote.
          </p>

          {erro && (
            <p className="text-sm text-red-300 bg-red-900/20 border border-red-800/40 rounded px-3 py-2 mb-3">
              {erro}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={gerarSpin}
              disabled={gerando}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 text-white font-semibold"
            >
              {gerando
                ? "Gerando (pode levar 20-40s)..."
                : spin
                ? "🔄 Regenerar SPIN"
                : "✨ Gerar SPIN com IA"}
            </button>
            {spin && (
              <button
                onClick={iniciarSessao}
                disabled={iniciandoSessao}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold"
              >
                {iniciandoSessao
                  ? "Iniciando..."
                  : "▶ Iniciar atendimento com este SPIN"}
              </button>
            )}
          </div>
          {providerUsado && (
            <p className="text-[10px] text-purple-300/70 mt-3">
              Gerado por: {providerUsado}
            </p>
          )}
        </div>

        {/* Preview SPIN */}
        {spin && (
          <div className="mt-6 space-y-5">
            <h2 className="text-xl font-bold text-white">SPIN gerado — preview</h2>

            <Bloco titulo="🎯 Pilares de curadoria">
              {spin.pilares.map((p, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <p className="text-sm font-semibold text-purple-300">{p.titulo}</p>
                  <p className="text-sm text-slate-300">{p.texto}</p>
                </div>
              ))}
            </Bloco>

            <Bloco titulo="⚠️ Perdas se montar sozinho">
              <ul className="space-y-1 text-sm text-slate-300 list-disc list-inside">
                {spin.perdasMontarSozinho.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </Bloco>

            <Bloco titulo="💬 WhatsApp — levar para chamada">
              {spin.perguntasWhatsApp.map((p, i) => (
                <Pergunta key={i} p={p} />
              ))}
            </Bloco>

            <Bloco titulo="🟢 Situação — sonho, perfil, histórico">
              {spin.perguntasSituacao.map((p, i) => (
                <Pergunta key={i} p={p} />
              ))}
            </Bloco>

            <Bloco titulo="🟡 Problema — montar sozinho">
              {spin.perguntasProblema.map((p, i) => (
                <Pergunta key={i} p={p} />
              ))}
            </Bloco>

            <Bloco titulo="🔴 Implicação — dor de escolher errado">
              {spin.perguntasImplicacao.map((p, i) => (
                <Pergunta key={i} p={p} />
              ))}
            </Bloco>

            <Bloco titulo="✨ Need-Payoff — ele descreve a solução">
              {spin.perguntasNeedPayoff.map((p, i) => (
                <Pergunta key={i} p={p} />
              ))}
            </Bloco>

            <Bloco titulo="📋 Roteiro da proposta">
              <ol className="space-y-1 text-sm text-slate-300 list-decimal list-inside">
                {spin.roteiroProposta.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ol>
            </Bloco>

            <Bloco titulo="🎯 Micro-compromissos">
              <ul className="space-y-1 text-sm text-slate-300">
                {spin.microCompromissos.map((r, i) => (
                  <li key={i}>&ldquo;{r}&rdquo;</li>
                ))}
              </ul>
            </Bloco>

            <Bloco titulo="💎 Frases de alto nível">
              <ul className="space-y-2 text-sm text-slate-200">
                {spin.frasesAltoNivel.map((r, i) => (
                  <li key={i} className="italic pl-3 border-l-2 border-emerald-500/50">
                    &ldquo;{r}&rdquo;
                  </li>
                ))}
              </ul>
            </Bloco>
          </div>
        )}
      </div>
    </div>
  );
}

function Bloco({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-3">{titulo}</h3>
      {children}
    </div>
  );
}

function Pergunta({
  p,
}: {
  p: { texto: string; foco: string; capturar?: string };
}) {
  return (
    <div className="mb-3 last:mb-0 pl-3 border-l-2 border-purple-500/30">
      <p className="text-sm text-slate-100 italic">&ldquo;{p.texto}&rdquo;</p>
      <p className="text-[11px] text-slate-500 mt-1">
        <span className="text-purple-400">foco:</span> {p.foco}
      </p>
      {p.capturar && (
        <p className="text-[11px] text-slate-500">
          <span className="text-amber-400">capturar:</span> {p.capturar}
        </p>
      )}
    </div>
  );
}
