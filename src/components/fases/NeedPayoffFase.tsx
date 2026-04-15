"use client";

import { useState } from "react";
import { PERGUNTAS } from "@/lib/perguntas";
import { ACOES_PLANO } from "@/lib/acoes";
import type { SessaoAoVivo } from "@/app/sessao/[id]/ao-vivo/page";

interface Props {
  sessao: SessaoAoVivo;
  onConcluir: () => void;
  onRefresh: () => void;
}

export function NeedPayoffFase({ sessao, onConcluir, onRefresh }: Props) {
  const respostasMap: Record<number, boolean> = {};
  sessao.respostas.forEach((r) => (respostasMap[r.perguntaId] = r.resposta));

  const problemasIds = Object.keys(respostasMap)
    .filter((k) => respostasMap[Number(k)] === false)
    .map(Number);

  const [validados, setValidados] = useState<Set<number>>(new Set());
  const [fraseTexto, setFraseTexto] = useState("");
  const [perguntaAtivaId, setPerguntaAtivaId] = useState<number>(
    problemasIds[0] || 0
  );

  const perguntaAtiva = PERGUNTAS.find((p) => p.id === perguntaAtivaId);

  async function salvarFrase() {
    if (!fraseTexto.trim()) return;
    await fetch(`/api/sessoes/${sessao.id}/frases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fase: "needPayoff",
        texto: fraseTexto.trim(),
        perguntaId: perguntaAtivaId,
      }),
    });
    setFraseTexto("");
    onRefresh();
  }

  function toggleValidado(pid: number) {
    const nova = new Set(validados);
    if (nova.has(pid)) nova.delete(pid);
    else nova.add(pid);
    setValidados(nova);
  }

  // Mapear pergunta → ações (via módulo Entur OS)
  const modulosValidados = new Set(
    Array.from(validados)
      .map((pid) => PERGUNTAS.find((p) => p.id === pid)?.moduloEnturOS)
      .filter(Boolean)
  );
  const acoesRecomendadas = ACOES_PLANO.filter((a) =>
    modulosValidados.has(a.moduloEnturOS) ||
    Array.from(validados).some((pid) => {
      const p = PERGUNTAS.find((pp) => pp.id === pid);
      return p && a.preRequisito.includes(`Pergunta ${pid}`);
    })
  );

  const podeAvancar = validados.size >= 2;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Transição */}
      <div className="p-4 rounded-xl bg-emerald-900/20 border border-emerald-800/40">
        <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-2">
          Transição — leia em voz alta
        </p>
        <p className="text-slate-100 italic leading-relaxed">
          &ldquo;Agora eu quero fazer um exercício com você, {sessao.prospect?.nome || "vamos lá"}. Imagina que a
          gente resolveu cada um desses pontos. Me conta como isso muda a operação.&rdquo;
        </p>
      </div>

      {/* Seletor */}
      <div className="flex gap-1.5 flex-wrap">
        {problemasIds.map((pid) => (
          <button
            key={pid}
            onClick={() => setPerguntaAtivaId(pid)}
            className={`px-3 py-1.5 rounded text-xs font-medium ${
              perguntaAtivaId === pid
                ? "bg-emerald-600 text-white"
                : validados.has(pid)
                ? "bg-emerald-900/40 text-emerald-300 border border-emerald-800/60"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {validados.has(pid) ? "✓ " : ""}P{pid}
          </button>
        ))}
      </div>

      {/* Pergunta ativa */}
      {perguntaAtiva && (
        <div className="p-5 rounded-xl bg-emerald-900/15 border border-emerald-800/40">
          <p className="text-xs text-slate-500 mb-1">
            Contexto: {perguntaAtiva.texto}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-2">
            Pergunta de Need-Payoff — faça agora
          </p>
          <p className="text-lg text-slate-100 italic leading-relaxed font-medium">
            &ldquo;{perguntaAtiva.needPayoff}&rdquo;
          </p>
          <p className="text-[11px] text-emerald-300/60 mt-3 italic">
            Deixe ele responder. Não fale a solução — deixe ele descrever.
          </p>

          <div className="mt-4 flex items-center gap-3 pt-3 border-t border-emerald-800/30">
            <button
              onClick={() => toggleValidado(perguntaAtivaId)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                validados.has(perguntaAtivaId)
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-100"
              }`}
            >
              {validados.has(perguntaAtivaId)
                ? "✓ Payoff validado"
                : "Ele validou esse payoff"}
            </button>
            <span className="text-xs text-slate-500">
              Módulo conectado: <strong className="text-emerald-400">{perguntaAtiva.moduloEnturOS}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Capturar frase */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-2">
          Capture como ele descreveu a solução
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={fraseTexto}
            onChange={(e) => setFraseTexto(e.target.value)}
            placeholder={`ex: "se eu tivesse isso, fechava o dobro"`}
            className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={salvarFrase}
            disabled={!fraseTexto.trim()}
            className="px-3 py-2 rounded bg-emerald-700 hover:bg-emerald-600 text-sm disabled:opacity-40"
          >
            + Salvar
          </button>
        </div>
      </div>

      {/* Ponte para a solução */}
      {validados.size >= 2 && (
        <div className="p-5 rounded-xl bg-emerald-600/10 border-2 border-emerald-600/40">
          <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-2">
            Ponte para a solução — leia em voz alta
          </p>
          <p className="text-lg text-slate-100 italic leading-relaxed font-medium">
            &ldquo;Tudo que você acabou de descrever — {Array.from(validados).length} coisas — é exatamente o que o Entur OS faz.
            Cada um desses processos já está pronto e automatizado. Posso te mostrar como se encaixa na sua operação?&rdquo;
          </p>

          {acoesRecomendadas.length > 0 && (
            <div className="mt-4 pt-4 border-t border-emerald-600/30">
              <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-3">
                Roadmap de implementação (baseado nos payoffs validados)
              </p>
              <div className="space-y-2">
                {acoesRecomendadas.slice(0, 5).map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-lg bg-slate-900/60 border border-slate-800"
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <p className="text-sm font-semibold text-slate-100">
                        {a.acao}
                      </p>
                      <span className="text-[10px] text-emerald-400 shrink-0 whitespace-nowrap">
                        {a.prazoSugerido}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Módulo: <span className="text-emerald-400">{a.moduloEnturOS}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {podeAvancar
            ? `${validados.size} payoffs validados. Pode ir para Fechamento.`
            : `Valide pelo menos 2 payoffs para fechar (${validados.size}/2).`}
        </p>
        <button
          onClick={onConcluir}
          disabled={!podeAvancar}
          className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
        >
          Ir para Fechamento →
        </button>
      </div>
    </div>
  );
}
