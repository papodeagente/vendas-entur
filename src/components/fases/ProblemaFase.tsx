"use client";

import { useState } from "react";
import { PERGUNTAS, ORDEM_FASE_PROBLEMA } from "@/lib/perguntas";
import type { SessaoAoVivo } from "@/app/sessao/[id]/ao-vivo/page";

interface Props {
  sessao: SessaoAoVivo;
  onConcluir: () => void;
  onRefresh: () => void;
}

export function ProblemaFase({ sessao, onConcluir, onRefresh }: Props) {
  const respostasMap: Record<number, boolean> = {};
  const severidadeMap: Record<number, number | null> = {};
  sessao.respostas.forEach((r) => {
    respostasMap[r.perguntaId] = r.resposta;
    severidadeMap[r.perguntaId] = r.severidade;
  });

  const perguntasOrdenadas = ORDEM_FASE_PROBLEMA
    .map((id) => PERGUNTAS.find((p) => p.id === id))
    .filter(Boolean) as typeof PERGUNTAS;

  const [perguntaAtivaId, setPerguntaAtivaId] = useState<number>(
    perguntasOrdenadas.find((p) => respostasMap[p.id] === undefined)?.id ||
      perguntasOrdenadas[0].id
  );
  const [fraseTexto, setFraseTexto] = useState("");
  const [mostrarAprofundamento, setMostrarAprofundamento] = useState(false);

  const perguntaAtiva = PERGUNTAS.find((p) => p.id === perguntaAtivaId)!;

  // Frases capturadas para a pergunta ativa
  const frasesDestaPergunta = sessao.frases.filter(
    (f) => f.fase === "problema" && f.perguntaId === perguntaAtivaId
  );

  // Um problema confirmado (resposta=false) precisa de pelo menos 1 frase
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
    const idx = perguntasOrdenadas.findIndex((p) => p.id === perguntaAtivaId);
    const proxima = perguntasOrdenadas
      .slice(idx + 1)
      .find((p) => respostasMap[p.id] === undefined);
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

  const problemasConfirmados = Object.keys(respostasMap).filter(
    (k) => respostasMap[Number(k)] === false
  ).length;
  const totalRespondidas = Object.keys(respostasMap).length;

  // Todos os problemas confirmados precisam ter pelo menos 1 frase
  const todosProblemasTemFrase = Object.keys(respostasMap)
    .filter((k) => respostasMap[Number(k)] === false)
    .every((k) => problemaTemFrase(Number(k)));

  const podeAvancar = problemasConfirmados >= 3 && todosProblemasTemFrase;

  // Aviso: problemas sem frase
  const problemasSemFrase = Object.keys(respostasMap)
    .filter((k) => respostasMap[Number(k)] === false && !problemaTemFrase(Number(k)))
    .map(Number);

  // Check se a pergunta ativa é um problema sem frase (bloqueia "Próxima")
  const ativaEhProblemaSemFrase =
    respostasMap[perguntaAtivaId] === false &&
    !problemaTemFrase(perguntaAtivaId);

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Pergunta ativa */}
      <div className="p-5 rounded-xl bg-amber-900/20 border border-amber-800/40">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-[10px] uppercase tracking-wider text-amber-400">
            Pergunta SPIN — leia em voz alta
          </p>
          <span className="text-[10px] text-amber-300/60">
            Alavanca: {perguntaAtiva.alavancas.join(", ")}
          </span>
        </div>
        <p className="text-lg text-slate-100 leading-relaxed font-medium italic">
          &ldquo;{perguntaAtiva.perguntaSpin}&rdquo;
        </p>
      </div>

      {/* 3 botões de registro (escala de dor) */}
      <div>
        <p className="text-xs text-slate-500 mb-2">
          Registre o que ele disse — qual o grau da dor:
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => marcar(false, 1)}
            className={`px-4 py-3 rounded-lg border font-medium text-sm transition-all ${
              respostasMap[perguntaAtivaId] === false && severidadeMap[perguntaAtivaId] === 1
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
              respostasMap[perguntaAtivaId] === false && severidadeMap[perguntaAtivaId] === 2
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

      {/* Aprofundamento após confirmar problema */}
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

          {/* Frases já capturadas para esta pergunta */}
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

      {/* Mapa das 10 perguntas */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-3">
          Roteiro ({totalRespondidas}/10 respondidas · {problemasConfirmados} problemas)
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {perguntasOrdenadas.map((p) => {
            const resp = respostasMap[p.id];
            const sev = severidadeMap[p.id];
            const isActive = perguntaAtivaId === p.id;
            const semFrase = resp === false && !problemaTemFrase(p.id);
            return (
              <button
                key={p.id}
                onClick={() => {
                  setPerguntaAtivaId(p.id);
                  setMostrarAprofundamento(resp === false);
                }}
                className={`px-2 py-1.5 rounded text-xs font-medium transition relative ${
                  isActive
                    ? "bg-amber-600 text-white"
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
                P{p.id}
                {semFrase && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </div>
        {problemasSemFrase.length > 0 && (
          <p className="text-[10px] text-red-400 mt-2">
            ⚠ P{problemasSemFrase.join(", P")} — problema confirmado sem frase
            capturada. Clique para adicionar.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {problemasConfirmados < 3
            ? `Mapeie pelo menos 3 problemas (${problemasConfirmados}/3).`
            : !todosProblemasTemFrase
            ? "Capture frases para todos os problemas confirmados antes de avançar."
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
