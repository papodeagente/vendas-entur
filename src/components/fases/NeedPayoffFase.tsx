"use client";

import { useState } from "react";
import { PERGUNTAS, BLOCOS, type Alavanca } from "@/lib/perguntas";
import { ACOES_PLANO } from "@/lib/acoes";
import type { SessaoAoVivo } from "@/app/sessao/[id]/ao-vivo/page";

interface Props {
  sessao: SessaoAoVivo;
  onConcluir: () => void;
  onRefresh: () => void;
}

const STYLE: Record<
  Alavanca,
  { bg: string; border: string; accent: string }
> = {
  recuperacao: {
    bg: "bg-red-900/20",
    border: "border-red-800/40",
    accent: "text-red-400",
  },
  recorrencia: {
    bg: "bg-amber-900/20",
    border: "border-amber-800/40",
    accent: "text-amber-400",
  },
  indicacao: {
    bg: "bg-emerald-900/20",
    border: "border-emerald-800/40",
    accent: "text-emerald-400",
  },
};

// Need-Payoff por alavanca — pergunta que faz o prospect DESCREVER a solução
// sem que o vendedor diga "CRM"
const PERGUNTAS_NEED_PAYOFF: Record<
  Alavanca,
  {
    titulo: string;
    pergunta: string;
    espera: string;
    moduloEntur: string;
  }
> = {
  recuperacao: {
    titulo: "🎯 Need-Payoff Recuperação",
    pergunta:
      "Se existisse um sistema que, automaticamente, no momento que o lead não respondeu em 48h, disparasse uma sequência de mensagens personalizadas pra recuperar ele — sem o vendedor precisar lembrar — o que isso mudaria no seu mês?",
    espera:
      "Espera ele descrever: automação de follow-up, cadência sem dependência humana, recuperação automática.",
    moduloEntur: "Automação de Follow-up + CRM Kanban (Atendimento Perdido)",
  },
  recorrencia: {
    titulo: "🔄 Need-Payoff Recorrência",
    pergunta:
      "Se você tivesse uma ferramenta que identificasse sozinha quais clientes estão no momento ideal de recompra — aniversário chegando, tempo sem comprar, data de viagem se aproximando — e já avisasse o vendedor 'liga pra esse aqui'... como seria?",
    espera:
      "Espera ele descrever: CRM com gatilhos automáticos por data, agenda inteligente, antecipação.",
    moduloEntur: "Gatilhos Automáticos por Data + Carteira de Clientes",
  },
  indicacao: {
    titulo: "🌱 Need-Payoff Indicação",
    pergunta:
      "Se depois de cada viagem realizada, o sistema automaticamente abordasse o cliente pedindo indicação no momento de maior satisfação, e ainda rastreasse quem indicou quem... isso muda alguma coisa?",
    espera:
      "Espera ele descrever: programa estruturado de indicação automatizado, rastreio, recompensa.",
    moduloEntur: "Automação de Pós-Viagem + Programa de Indicação",
  },
};

export function NeedPayoffFase({ sessao, onConcluir, onRefresh }: Props) {
  const respostasMap: Record<number, boolean> = {};
  sessao.respostas.forEach((r) => (respostasMap[r.perguntaId] = r.resposta));

  // Alavancas com problema confirmado
  const alavancasComDor = (
    ["recuperacao", "recorrencia", "indicacao"] as const
  ).filter((al) =>
    PERGUNTAS.filter((p) => p.bloco === al).some(
      (p) => respostasMap[p.id] === false
    )
  );

  const [alavancaAtiva, setAlavancaAtiva] = useState<Alavanca>(
    alavancasComDor[0] || "recuperacao"
  );
  const [validados, setValidados] = useState<Set<Alavanca>>(new Set());
  const [fraseTexto, setFraseTexto] = useState("");

  // Captura obrigatória por alavanca
  function temFrasePayoff(al: Alavanca): boolean {
    return sessao.frases.some(
      (f) =>
        f.fase === "needPayoff" && f.texto.toLowerCase().includes(al)
    );
  }

  function frasesDestaAlavanca(al: Alavanca) {
    return sessao.frases.filter(
      (f) =>
        f.fase === "needPayoff" && f.texto.toLowerCase().includes(al)
    );
  }

  async function salvarFrase() {
    if (!fraseTexto.trim()) return;
    await fetch(`/api/sessoes/${sessao.id}/frases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fase: "needPayoff",
        texto: `[${alavancaAtiva}] ${fraseTexto.trim()}`,
        perguntaId: null,
      }),
    });
    setFraseTexto("");
    onRefresh();
  }

  function toggleValidado(al: Alavanca) {
    if (!temFrasePayoff(al)) return;
    const nova = new Set(validados);
    if (nova.has(al)) nova.delete(al);
    else nova.add(al);
    setValidados(nova);
  }

  // Ações recomendadas pelas alavancas validadas
  const acoesRecomendadas = ACOES_PLANO.filter((a) =>
    Array.from(validados).includes(a.alavanca)
  );

  const podeAvancar = validados.size >= 2;

  const meta = PERGUNTAS_NEED_PAYOFF[alavancaAtiva];
  const style = STYLE[alavancaAtiva];

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Transição */}
      <div className="p-4 rounded-xl bg-emerald-900/20 border border-emerald-800/40">
        <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-2">
          Transição — leia em voz alta
        </p>
        <p className="text-slate-100 italic leading-relaxed">
          &ldquo;Agora eu quero fazer um exercício com você,{" "}
          {sessao.prospect?.nome || "vamos lá"}. Imagina que a gente resolveu
          cada um desses pontos. Me conta como isso muda a operação.&rdquo;
        </p>
      </div>

      {/* Seletor de alavancas */}
      <div className="flex gap-2 flex-wrap">
        {alavancasComDor.map((al) => {
          const m = BLOCOS[al];
          const s = STYLE[al];
          const ehAtiva = al === alavancaAtiva;
          const ehValidada = validados.has(al);
          return (
            <button
              key={al}
              onClick={() => setAlavancaAtiva(al)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                ehAtiva
                  ? `${s.bg} ${s.border} border-2 ${s.accent}`
                  : ehValidada
                  ? "bg-emerald-900/30 border border-emerald-700 text-emerald-300"
                  : "bg-slate-900/40 border border-slate-800 text-slate-400 hover:bg-slate-800"
              }`}
            >
              {ehValidada ? "✓ " : ""}
              {m.emoji} {m.label}
            </button>
          );
        })}
      </div>

      {/* Pergunta Need-Payoff */}
      <div className={`p-5 rounded-xl border ${style.bg} ${style.border}`}>
        <p className={`text-[10px] uppercase tracking-wider ${style.accent} mb-2`}>
          {meta.titulo} — leia e CALE
        </p>
        <p className="text-lg text-slate-100 italic leading-relaxed font-medium mb-4">
          &ldquo;{meta.pergunta}&rdquo;
        </p>
        <p className="text-[11px] text-slate-400 italic mb-4">
          💡 {meta.espera}
        </p>
        <p className="text-[11px] text-emerald-300/70 italic mb-4 pt-3 border-t border-slate-800">
          ⚠️ NÃO fale CRM, automação, sistema. Deixe ele descrever com palavras dele.
          Quanto mais ele falar, mais ele vende pra ele mesmo.
        </p>

        {/* Captura obrigatória */}
        <div className="pt-3 border-t border-slate-800">
          <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-2">
            Capture EXATAMENTE como ele descreveu a solução
            {!temFrasePayoff(alavancaAtiva) && (
              <span className="text-red-400 ml-1">
                (obrigatório para validar)
              </span>
            )}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={fraseTexto}
              onChange={(e) => setFraseTexto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && salvarFrase()}
              placeholder={`ex: "algo que lembre o vendedor de ligar"`}
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

          {frasesDestaAlavanca(alavancaAtiva).length > 0 && (
            <div className="space-y-1 mt-3">
              {frasesDestaAlavanca(alavancaAtiva).map((f) => (
                <p
                  key={f.id}
                  className="text-xs text-emerald-200 italic pl-3 border-l-2 border-emerald-500/50"
                >
                  &ldquo;{f.texto.replace(/^\[\w+\]\s*/, "")}&rdquo;
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Botão de validação */}
        <div className="mt-4 flex items-center gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => toggleValidado(alavancaAtiva)}
            disabled={!temFrasePayoff(alavancaAtiva)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              validados.has(alavancaAtiva)
                ? "bg-emerald-600 text-white"
                : temFrasePayoff(alavancaAtiva)
                ? "bg-slate-700 hover:bg-slate-600 text-slate-100"
                : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
            }`}
          >
            {validados.has(alavancaAtiva)
              ? "✓ Payoff validado"
              : temFrasePayoff(alavancaAtiva)
              ? "Ele validou esse payoff"
              : "Capture a frase primeiro"}
          </button>
          <span className="text-xs text-slate-500">
            Módulo: <strong className="text-emerald-400">{meta.moduloEntur}</strong>
          </span>
        </div>
      </div>

      {/* Ponte para a solução */}
      {validados.size >= 2 && (
        <div className="p-5 rounded-xl bg-emerald-600/10 border-2 border-emerald-600/40">
          <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-2">
            Ponte para a solução — leia em voz alta
          </p>
          <p className="text-lg text-slate-100 italic leading-relaxed font-medium">
            &ldquo;Tudo que você acabou de descrever — {validados.size}{" "}
            {validados.size === 1 ? "alavanca" : "alavancas"} — é exatamente o
            que o Entur OS faz. Cada um desses processos já está pronto e
            automatizado. Posso te mostrar como se encaixa na sua
            operação?&rdquo;
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
                      Módulo:{" "}
                      <span className="text-emerald-400">{a.moduloEnturOS}</span>
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
            : `Valide pelo menos 2 alavancas (${validados.size}/2) para fechar.`}
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
