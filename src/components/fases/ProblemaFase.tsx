"use client";

import { useState } from "react";
import { PERGUNTAS, BLOCOS, type Alavanca } from "@/lib/perguntas";
import type { SessaoAoVivo } from "@/app/sessao/[id]/ao-vivo/page";

interface Props {
  sessao: SessaoAoVivo;
  onConcluir: () => void;
  onRefresh: () => void;
}

const BLOCO_ORDEM: Alavanca[] = ["recuperacao", "recorrencia", "indicacao"];

const BLOCO_STYLE: Record<
  Alavanca,
  { bg: string; border: string; accent: string }
> = {
  recuperacao: {
    bg: "bg-red-900/15",
    border: "border-red-800/40",
    accent: "text-red-400",
  },
  recorrencia: {
    bg: "bg-amber-900/15",
    border: "border-amber-800/40",
    accent: "text-amber-400",
  },
  indicacao: {
    bg: "bg-emerald-900/15",
    border: "border-emerald-800/40",
    accent: "text-emerald-400",
  },
};

export function ProblemaFase({ sessao, onConcluir, onRefresh }: Props) {
  const respostasMap: Record<number, boolean> = {};
  const severidadeMap: Record<number, number | null> = {};
  sessao.respostas.forEach((r) => {
    respostasMap[r.perguntaId] = r.resposta;
    severidadeMap[r.perguntaId] = r.severidade;
  });

  const primeiraNaoRespondida =
    PERGUNTAS.find((p) => respostasMap[p.id] === undefined)?.id || 1;

  const [perguntaAtivaId, setPerguntaAtivaId] = useState<number>(
    primeiraNaoRespondida
  );
  const [fraseTexto, setFraseTexto] = useState("");
  const [mostrarAprofundamento, setMostrarAprofundamento] = useState(false);

  const perguntaAtiva = PERGUNTAS.find((p) => p.id === perguntaAtivaId)!;

  const frasesDestaPergunta = sessao.frases.filter(
    (f) => f.fase === "problema" && f.perguntaId === perguntaAtivaId
  );

  function problemaTemFrase(pid: number): boolean {
    return sessao.frases.some(
      (f) => f.fase === "problema" && f.perguntaId === pid
    );
  }

  async function marcar(resposta: boolean, severidade: number | null) {
    await fetch(`/api/sessoes/${sessao.id}/diagnostico`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        respostas: [{ perguntaId: perguntaAtivaId, resposta, severidade }],
      }),
    });
    if (resposta === false) {
      setMostrarAprofundamento(true);
    } else {
      setMostrarAprofundamento(false);
      proximaPergunta();
    }
    onRefresh();
  }

  function proximaPergunta() {
    const idx = PERGUNTAS.findIndex((p) => p.id === perguntaAtivaId);
    const proxima = PERGUNTAS.slice(idx + 1).find(
      (p) => respostasMap[p.id] === undefined
    );
    if (proxima) {
      setPerguntaAtivaId(proxima.id);
      setMostrarAprofundamento(false);
    }
  }

  async function salvarFrase() {
    if (!fraseTexto.trim()) return;
    await fetch(`/api/sessoes/${sessao.id}/frases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fase: "problema",
        texto: fraseTexto.trim(),
        perguntaId: perguntaAtivaId,
      }),
    });
    setFraseTexto("");
    onRefresh();
  }

  function statsBloco(alav: Alavanca) {
    const ids = PERGUNTAS.filter((p) => p.bloco === alav).map((p) => p.id);
    const dorForte = ids.filter(
      (id) => respostasMap[id] === false && severidadeMap[id] === 1
    ).length;
    const dorMedia = ids.filter(
      (id) => respostasMap[id] === false && severidadeMap[id] === 2
    ).length;
    const total = dorForte + dorMedia;
    const respondidas = ids.filter(
      (id) => respostasMap[id] !== undefined
    ).length;
    return {
      ids,
      dorForte,
      dorMedia,
      total,
      respondidas,
      completo: respondidas === ids.length,
    };
  }

  const totalProblemas = Object.keys(respostasMap).filter(
    (k) => respostasMap[Number(k)] === false
  ).length;

  const todosProblemasTemFrase = Object.keys(respostasMap)
    .filter((k) => respostasMap[Number(k)] === false)
    .every((k) => problemaTemFrase(Number(k)));

  const podeAvancar = totalProblemas >= 3 && todosProblemasTemFrase;

  const alavancaDominante = BLOCO_ORDEM.find(
    (al) => statsBloco(al).dorForte >= 2
  );

  const ativaEhProblemaSemFrase =
    respostasMap[perguntaAtivaId] === false &&
    !problemaTemFrase(perguntaAtivaId);

  const styleAtiva = BLOCO_STYLE[perguntaAtiva.bloco];

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header com 3 blocos */}
      <div className="grid grid-cols-3 gap-3">
        {BLOCO_ORDEM.map((alav) => {
          const stats = statsBloco(alav);
          const meta = BLOCOS[alav];
          const style = BLOCO_STYLE[alav];
          const ehDominante = alavancaDominante === alav;
          return (
            <div
              key={alav}
              className={`p-3 rounded-lg border ${style.bg} ${style.border} ${
                ehDominante
                  ? "ring-2 ring-offset-2 ring-offset-slate-950 ring-current"
                  : ""
              } relative`}
            >
              {ehDominante && (
                <span className="absolute -top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-current text-slate-950 font-bold">
                  ALAVANCA PRINCIPAL
                </span>
              )}
              <div
                className={`flex items-baseline justify-between mb-1 ${style.accent}`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {meta.emoji} {meta.label}
                </span>
                <span className="text-[10px] opacity-70">
                  {stats.respondidas}/{stats.ids.length}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mb-2">
                {meta.descricao}
              </p>
              <div className="flex gap-3 text-[10px]">
                <span className="text-red-400">🔴 {stats.dorForte}</span>
                <span className="text-amber-400">🟡 {stats.dorMedia}</span>
                <span className="text-emerald-500">
                  🟢 {stats.respondidas - stats.total}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pergunta ativa */}
      <div
        className={`p-5 rounded-xl border ${styleAtiva.bg} ${styleAtiva.border}`}
      >
        <div className="flex items-baseline justify-between mb-2">
          <p
            className={`text-[10px] uppercase tracking-wider ${styleAtiva.accent}`}
          >
            {BLOCOS[perguntaAtiva.bloco].emoji}{" "}
            {BLOCOS[perguntaAtiva.bloco].label} · Pergunta SPIN — leia em voz
            alta
          </p>
          <span className="text-[10px] text-slate-500">P{perguntaAtiva.id}</span>
        </div>
        <p className="text-lg text-slate-100 leading-relaxed font-medium italic">
          &ldquo;{perguntaAtiva.perguntaSpin}&rdquo;
        </p>
      </div>

      {/* 3 botões de severidade */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Registre o que ele disse:</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => marcar(false, 1)}
            className={`px-4 py-3 rounded-lg border font-medium text-sm transition-all ${
              respostasMap[perguntaAtivaId] === false &&
              severidadeMap[perguntaAtivaId] === 1
                ? "bg-red-600 border-red-500 text-white ring-2 ring-red-400"
                : "bg-red-900/40 hover:bg-red-900/60 border-red-800/60 text-red-100"
            }`}
          >
            <span className="block text-base mb-0.5">🔴</span>
            Dor forte
            <span className="block text-[10px] mt-0.5 opacity-70">
              Não tem processo nenhum
            </span>
          </button>
          <button
            onClick={() => marcar(false, 2)}
            className={`px-4 py-3 rounded-lg border font-medium text-sm transition-all ${
              respostasMap[perguntaAtivaId] === false &&
              severidadeMap[perguntaAtivaId] === 2
                ? "bg-amber-600 border-amber-500 text-white ring-2 ring-amber-400"
                : "bg-amber-900/30 hover:bg-amber-900/50 border-amber-800/60 text-amber-100"
            }`}
          >
            <span className="block text-base mb-0.5">🟡</span>
            Dor média
            <span className="block text-[10px] mt-0.5 opacity-70">
              Tem processo parcial / improvisado
            </span>
          </button>
          <button
            onClick={() => marcar(true, null)}
            className={`px-4 py-3 rounded-lg border font-medium text-sm transition-all ${
              respostasMap[perguntaAtivaId] === true
                ? "bg-emerald-600 border-emerald-500 text-white ring-2 ring-emerald-400"
                : "bg-emerald-900/20 hover:bg-emerald-900/40 border-emerald-800/60 text-emerald-100"
            }`}
          >
            <span className="block text-base mb-0.5">🟢</span>
            Resolvido
            <span className="block text-[10px] mt-0.5 opacity-70">
              Já tem processo estruturado
            </span>
          </button>
        </div>
      </div>

      {/* Aprofundamento */}
      {mostrarAprofundamento && respostasMap[perguntaAtivaId] === false && (
        <div className="p-4 rounded-xl bg-orange-900/20 border border-orange-800/40 space-y-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-orange-400 mb-2">
              Pergunta de aprofundamento — faça agora
            </p>
            <p className="text-slate-100 italic leading-relaxed">
              &ldquo;{perguntaAtiva.aprofundamento}&rdquo;
            </p>
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Capture a frase literal do cliente
              <span className="text-red-400 ml-1">
                (obrigatório para avançar)
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={fraseTexto}
                onChange={(e) => setFraseTexto(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && salvarFrase()}
                placeholder={`ex: "a gente perde muito lead assim"`}
                className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={salvarFrase}
                disabled={!fraseTexto.trim()}
                className="px-3 py-2 rounded bg-amber-700 hover:bg-amber-600 text-sm disabled:opacity-40"
              >
                + Salvar frase
              </button>
            </div>
          </div>

          {frasesDestaPergunta.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-orange-800/30">
              {frasesDestaPergunta.map((f) => (
                <p
                  key={f.id}
                  className="text-xs text-amber-200 italic pl-3 border-l-2 border-amber-500/50"
                >
                  &ldquo;{f.texto}&rdquo;
                </p>
              ))}
            </div>
          )}

          <button
            onClick={proximaPergunta}
            disabled={ativaEhProblemaSemFrase}
            className="text-xs text-orange-300 hover:text-orange-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {ativaEhProblemaSemFrase
              ? "Capture pelo menos 1 frase para avançar"
              : "Próxima pergunta →"}
          </button>
        </div>
      )}

      {/* Mapa das 10 perguntas agrupadas por bloco */}
      <div className="space-y-2">
        {BLOCO_ORDEM.map((alav) => {
          const ids = PERGUNTAS.filter((p) => p.bloco === alav).map((p) => p.id);
          const meta = BLOCOS[alav];
          const style = BLOCO_STYLE[alav];
          return (
            <div
              key={alav}
              className={`p-3 rounded-lg border ${style.bg} ${style.border}`}
            >
              <p
                className={`text-[10px] uppercase tracking-wider ${style.accent} mb-2`}
              >
                {meta.emoji} {meta.label}
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {ids.map((id) => {
                  const p = PERGUNTAS.find((pp) => pp.id === id)!;
                  const resp = respostasMap[id];
                  const sev = severidadeMap[id];
                  const isActive = perguntaAtivaId === id;
                  const semFrase = resp === false && !problemaTemFrase(id);
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setPerguntaAtivaId(id);
                        setMostrarAprofundamento(resp === false);
                      }}
                      className={`px-2 py-1.5 rounded text-xs font-medium transition relative ${
                        isActive
                          ? "bg-slate-100 text-slate-900"
                          : resp === false && sev === 1
                          ? "bg-red-900/50 text-red-300 border border-red-800/50"
                          : resp === false && sev === 2
                          ? "bg-amber-900/40 text-amber-300 border border-amber-800/40"
                          : resp === true
                          ? "bg-emerald-900/20 text-emerald-400"
                          : "bg-slate-800 text-slate-500"
                      }`}
                      title={p.texto}
                    >
                      P{id}
                      {semFrase && !isActive && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {totalProblemas < 3
            ? `Mapeie pelo menos 3 problemas (${totalProblemas}/3).`
            : !todosProblemasTemFrase
            ? "Capture frases para todos os problemas confirmados antes de avançar."
            : alavancaDominante
            ? `Alavanca dominante: ${BLOCOS[alavancaDominante].label}. Pode amplificar.`
            : "Mapeamento completo. Pode amplificar na Implicação."}
        </p>
        <button
          onClick={onConcluir}
          disabled={!podeAvancar}
          className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
        >
          Começar Implicação →
        </button>
      </div>
    </div>
  );
}
