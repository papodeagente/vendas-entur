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
  sessao.respostas.forEach((r) => (respostasMap[r.perguntaId] = r.resposta));

  // Ordem SPIN: Recuperação → Recorrência → Indicação
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

  async function marcar(resposta: boolean) {
    await fetch(`/api/sessoes/${sessao.id}/diagnostico`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        respostas: [{ perguntaId: perguntaAtivaId, resposta }],
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
  const podeAvancar = problemasConfirmados >= 3;

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

      {/* Botões de registro */}
      <div>
        <p className="text-xs text-slate-500 mb-2">
          Registre o que ele disse:
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => marcar(false)}
            className="flex-1 px-4 py-3 rounded-lg bg-red-900/40 hover:bg-red-900/60 border border-red-800/60 text-red-100 font-medium text-sm"
          >
            ✗ Ele tem esse problema (não tem o processo)
          </button>
          <button
            onClick={() => marcar(true)}
            className="flex-1 px-4 py-3 rounded-lg bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-100 font-medium text-sm"
          >
            ✓ Ele já resolveu isso (tem o processo)
          </button>
        </div>
      </div>

      {/* Aprofundamento após confirmar problema */}
      {mostrarAprofundamento && (
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
              Capture a frase literal do cliente (use depois na Implicação)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={fraseTexto}
                onChange={(e) => setFraseTexto(e.target.value)}
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
          <button
            onClick={proximaPergunta}
            className="text-xs text-orange-300 hover:text-orange-200"
          >
            Próxima pergunta →
          </button>
        </div>
      )}

      {/* Mapa das 10 perguntas */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-3">
          Roteiro ({totalRespondidas}/10 respondidas · {problemasConfirmados} problemas confirmados)
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {perguntasOrdenadas.map((p) => {
            const resp = respostasMap[p.id];
            const isActive = perguntaAtivaId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setPerguntaAtivaId(p.id);
                  setMostrarAprofundamento(resp === false);
                }}
                className={`px-2 py-1.5 rounded text-xs font-medium transition ${
                  isActive
                    ? "bg-amber-600 text-white"
                    : resp === false
                    ? "bg-red-900/40 text-red-300 border border-red-800/40"
                    : resp === true
                    ? "bg-emerald-900/20 text-emerald-400"
                    : "bg-slate-800 text-slate-500"
                }`}
                title={p.texto}
              >
                P{p.id}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {podeAvancar
            ? "Você já mapeou dores suficientes para avançar."
            : `Mapeie pelo menos 3 problemas confirmados (${problemasConfirmados}/3) para avançar.`}
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
