"use client";

import { useEffect, useState } from "react";
import { FASES_MAP, FaseKey } from "@/lib/fases";
import type { SessaoAoVivo } from "@/app/sessao/[id]/ao-vivo/page";

interface Props {
  faseAtiva: FaseKey;
  sessao: SessaoAoVivo;
  respostas: Record<number, boolean>;
}

export function PainelCoach({ faseAtiva, sessao, respostas }: Props) {
  const meta = FASES_MAP[faseAtiva];
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    const inicio = Date.now();
    const t = setInterval(() => {
      setSegundos(Math.floor((Date.now() - inicio) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [faseAtiva]);

  const minutosAlvo = meta.duracaoMin;
  const segundosAlvo = minutosAlvo * 60;
  const pct = Math.min(100, (segundos / segundosAlvo) * 100);
  const barraCor =
    pct < 70
      ? "bg-emerald-500"
      : pct < 100
      ? "bg-amber-500"
      : "bg-red-500";

  const mm = String(Math.floor(segundos / 60)).padStart(2, "0");
  const ss = String(segundos % 60).padStart(2, "0");

  const frasesDaSessao = sessao.frases || [];
  const problemasMarcados = Object.keys(respostas)
    .filter((k) => respostas[Number(k)] === false)
    .map(Number);

  return (
    <div className="space-y-6">
      {/* Cronômetro */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500">
            Tempo na fase
          </span>
          <span className="text-[10px] text-slate-500">
            alvo {minutosAlvo} min
          </span>
        </div>
        <div className="text-2xl font-bold tabular-nums mb-2">
          {mm}:{ss}
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${barraCor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Dica SPIN */}
      <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-800/40">
        <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-1">
          Coach sênior
        </p>
        <p className="text-sm text-emerald-100 leading-relaxed">
          {meta.spinTip}
        </p>
      </div>

      {/* Contador de problemas confirmados */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
          Progresso SPIN
        </p>
        <div className="space-y-2 text-xs">
          <Linha label="Dados coletados" ok={!!sessao.dados} />
          <Linha
            label="Prospect identificado"
            ok={!!sessao.prospect?.nome}
          />
          <Linha
            label={`Problemas confirmados (${problemasMarcados.length}/10)`}
            ok={problemasMarcados.length >= 3}
          />
          <Linha
            label={`Frases capturadas (${frasesDaSessao.length})`}
            ok={frasesDaSessao.length >= 2}
          />
        </div>
      </div>

      {/* Frases do cliente */}
      {frasesDaSessao.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
            Frases do cliente
          </p>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {frasesDaSessao.slice(-6).map((f) => (
              <div
                key={f.id}
                className="p-2 rounded bg-slate-800/60 text-xs text-slate-300 border-l-2 border-amber-500"
              >
                &ldquo;{f.texto}&rdquo;
                <div className="text-[10px] text-slate-500 mt-1">
                  na fase {f.fase}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Red flag: perguntas fechadas demais */}
      {faseAtiva === "problema" && problemasMarcados.length < 3 && segundos > 240 && (
        <div className="p-3 rounded-lg bg-red-900/30 border border-red-800/60">
          <p className="text-[10px] uppercase tracking-wider text-red-400 mb-1">
            Red flag
          </p>
          <p className="text-xs text-red-100">
            4 min nessa fase e ainda não identificou 3 problemas. Abra mais — peça exemplos concretos.
          </p>
        </div>
      )}
    </div>
  );
}

function Linha({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
          ok ? "bg-emerald-500/30 text-emerald-300" : "bg-slate-800 text-slate-600"
        }`}
      >
        {ok ? "✓" : "·"}
      </span>
      <span className={ok ? "text-slate-300" : "text-slate-500"}>{label}</span>
    </div>
  );
}
