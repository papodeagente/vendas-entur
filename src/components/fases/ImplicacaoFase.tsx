"use client";

import { useState } from "react";
import { PERGUNTAS } from "@/lib/perguntas";
import { dinheiroNaMesa } from "@/lib/calculo";
import type { SessaoAoVivo } from "@/app/sessao/[id]/ao-vivo/page";

interface Props {
  sessao: SessaoAoVivo;
  onConcluir: () => void;
  onRefresh: () => void;
}

function brl(n: number) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function preencherVariaveis(texto: string, vars: Record<string, number>) {
  let out = texto;
  Object.entries(vars).forEach(([k, v]) => {
    out = out.replaceAll(`{${k}}`, brl(v));
  });
  return out;
}

export function ImplicacaoFase({ sessao, onConcluir, onRefresh }: Props) {
  const respostasMap: Record<number, boolean> = {};
  const severidadeMap: Record<number, number | null> = {};
  sessao.respostas.forEach((r) => {
    respostasMap[r.perguntaId] = r.resposta;
    severidadeMap[r.perguntaId] = r.severidade;
  });

  // Problemas confirmados (resposta = false), ordenados por severidade (forte primeiro)
  const problemasIds = Object.keys(respostasMap)
    .filter((k) => respostasMap[Number(k)] === false)
    .map(Number)
    .sort((a, b) => (severidadeMap[a] ?? 9) - (severidadeMap[b] ?? 9));

  const r = sessao.dados
    ? dinheiroNaMesa(respostasMap, sessao.dados)
    : null;

  const vars: Record<string, number> = r
    ? {
        valorRecuperacaoMes: r.recuperacao,
        valorRecuperacaoAno: r.recuperacao * 12,
        valorRecorrenciaMes: r.recorrencia,
        valorRecorrenciaAno: r.recorrencia * 12,
        valorIndicacaoMes: r.indicacao,
        valorIndicacaoAno: r.indicacao * 12,
      }
    : {};

  const [perguntaAtivaId, setPerguntaAtivaId] = useState<number>(
    problemasIds[0] || 0
  );
  const [mostrarImpacto, setMostrarImpacto] = useState(false);
  const [fraseTexto, setFraseTexto] = useState("");

  const perguntaAtiva = PERGUNTAS.find((p) => p.id === perguntaAtivaId);

  // Frases filtradas: da pergunta ativa na fase problema
  const frasesDestaPergunta = sessao.frases.filter(
    (f) => f.fase === "problema" && f.perguntaId === perguntaAtivaId
  );

  async function salvarFrase() {
    if (!fraseTexto.trim()) return;
    await fetch(`/api/sessoes/${sessao.id}/frases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fase: "implicacao",
        texto: fraseTexto.trim(),
        perguntaId: perguntaAtivaId,
      }),
    });
    setFraseTexto("");
    onRefresh();
  }

  if (!sessao.dados) {
    return (
      <div className="p-6 rounded-xl bg-amber-900/20 border border-amber-800/40 text-amber-200">
        Preencha os dados na Fase Situação antes de entrar em Implicação.
      </div>
    );
  }

  if (problemasIds.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-amber-900/20 border border-amber-800/40 text-amber-200">
        Nenhum problema confirmado. Volte à Fase Problema para mapear as dores.
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Script de ponte */}
      <div className="p-4 rounded-xl bg-orange-900/20 border border-orange-800/40">
        <p className="text-[10px] uppercase tracking-wider text-orange-400 mb-2">
          Transição — leia em voz alta
        </p>
        <p className="text-slate-100 italic leading-relaxed">
          &ldquo;{sessao.prospect?.nome || "Então"}, a gente mapeou{" "}
          {problemasIds.length} pontos hoje. Eu queria entender com você o
          impacto disso. Posso te mostrar como eu olho pra esses números?&rdquo;
        </p>
      </div>

      {/* Contraste ANTES vs DEPOIS */}
      {r && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-red-900/20 border border-red-800/40">
            <p className="text-[10px] uppercase tracking-wider text-red-400 mb-2">
              Cenário atual (sem processo)
            </p>
            <p className="text-2xl font-bold text-red-300 tabular-nums">
              {brl(r.recuperacaoHoje + r.recorrenciaHoje + r.indicacaoHoje)}
              <span className="text-sm font-normal text-red-400">/mês</span>
            </p>
            <div className="mt-2 text-xs text-red-300/70 space-y-0.5">
              <p>Recuperação: {brl(r.recuperacaoHoje)}</p>
              <p>Recorrência: {brl(r.recorrenciaHoje)}</p>
              <p>Indicação: {brl(r.indicacaoHoje)}</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-900/20 border border-emerald-800/40">
            <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-2">
              Cenário com Entur OS
            </p>
            <p className="text-2xl font-bold text-emerald-300 tabular-nums">
              {brl(
                r.recuperacaoHoje +
                  r.recorrenciaHoje +
                  r.indicacaoHoje +
                  r.totalMes
              )}
              <span className="text-sm font-normal text-emerald-400">/mês</span>
            </p>
            <div className="mt-2 text-xs text-emerald-300/70 space-y-0.5">
              <p>
                Recuperação: {brl(r.recuperacaoHoje + r.recuperacao)}{" "}
                <span className="text-emerald-400">
                  (+{brl(r.recuperacao)})
                </span>
              </p>
              <p>
                Recorrência: {brl(r.recorrenciaHoje + r.recorrencia)}{" "}
                <span className="text-emerald-400">
                  (+{brl(r.recorrencia)})
                </span>
              </p>
              <p>
                Indicação: {brl(r.indicacaoHoje + r.indicacao)}{" "}
                <span className="text-emerald-400">
                  (+{brl(r.indicacao)})
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delta mensal/anual */}
      {r && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-800/30 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Dinheiro na Mesa (delta)
            </p>
            <p className="text-xl font-bold text-emerald-400 tabular-nums">
              +{brl(r.totalMes)}/mês → +{brl(r.totalAno)}/ano
            </p>
          </div>
          <p className="text-xs text-slate-500 italic">
            &ldquo;A cada dia sem processo: -{brl(r.totalMes / 30)}&rdquo;
          </p>
        </div>
      )}

      {/* Perguntas de implicação — uma por problema */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-[10px] uppercase tracking-wider text-orange-400">
            Pergunta de Implicação — amplifique a dor
          </p>
        </div>

        <div className="flex gap-1.5 mb-4 flex-wrap">
          {problemasIds.map((pid) => (
            <button
              key={pid}
              onClick={() => {
                setPerguntaAtivaId(pid);
                setMostrarImpacto(false);
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium ${
                perguntaAtivaId === pid
                  ? "bg-orange-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {severidadeMap[pid] === 1 ? "🔴 " : "🟡 "}P{pid}
            </button>
          ))}
        </div>

        {perguntaAtiva && (
          <>
            <p className="text-xs text-slate-500 mb-2">
              Contexto: {perguntaAtiva.texto}
            </p>
            <p className="text-lg text-slate-100 italic leading-relaxed font-medium">
              &ldquo;{preencherVariaveis(perguntaAtiva.implicacao, vars)}&rdquo;
            </p>

            {/* Frases capturadas DESTA pergunta na fase Problema */}
            {frasesDestaPergunta.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-800">
                <p className="text-[10px] uppercase tracking-wider text-amber-400 mb-2">
                  Espelhe — use as palavras dele sobre P{perguntaAtivaId}
                </p>
                <div className="space-y-1">
                  {frasesDestaPergunta.map((f) => (
                    <p
                      key={f.id}
                      className="text-xs text-amber-200 italic pl-3 border-l-2 border-amber-500/50"
                    >
                      &ldquo;Você me disse: {f.texto}&rdquo;
                    </p>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => setMostrarImpacto(!mostrarImpacto)}
            className="px-4 py-2 rounded-lg bg-orange-700 hover:bg-orange-600 text-sm font-medium"
          >
            {mostrarImpacto ? "Esconder" : "Mostrar impacto"} visual
          </button>
          <span className="text-xs text-slate-500">
            Use quando sentir resistência — comparador tangível.
          </span>
        </div>
      </div>

      {/* Impacto visual (comparador) */}
      {mostrarImpacto && r && (
        <div className="p-5 rounded-xl bg-red-900/20 border border-red-800/40">
          <p className="text-[10px] uppercase tracking-wider text-red-400 mb-3">
            Impacto anual — comparador tangível
          </p>
          <p className="text-3xl font-bold text-red-300 mb-3 tabular-nums">
            {brl(r.totalAno)}
          </p>
          <div className="text-sm text-slate-300 space-y-1">
            <p>
              = {Math.floor(r.totalAno / 80000)} carros populares novos por ano
            </p>
            <p>= {Math.floor(r.totalAno / 15000)} viagens internacionais</p>
            <p>
              = a entrada de {(r.totalAno / 100000).toFixed(1)} apartamentos
            </p>
          </div>
        </div>
      )}

      {/* Captura de frase de implicação */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-2">
          Registre a reação dele ao número
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={fraseTexto}
            onChange={(e) => setFraseTexto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && salvarFrase()}
            placeholder={`ex: "caramba, não tinha ideia que era tanto"`}
            className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={salvarFrase}
            disabled={!fraseTexto.trim()}
            className="px-3 py-2 rounded bg-orange-700 hover:bg-orange-600 text-sm disabled:opacity-40"
          >
            + Salvar
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onConcluir}
          className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium"
        >
          Começar Need-Payoff →
        </button>
      </div>
    </div>
  );
}
