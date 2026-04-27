"use client";

import { useState } from "react";
import { PERGUNTAS, BLOCOS, type Alavanca } from "@/lib/perguntas";
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

const STYLE: Record<
  Alavanca,
  { bg: string; border: string; accent: string; ring: string }
> = {
  recuperacao: {
    bg: "bg-red-900/20",
    border: "border-red-800/40",
    accent: "text-red-400",
    ring: "ring-red-500",
  },
  recorrencia: {
    bg: "bg-amber-900/20",
    border: "border-amber-800/40",
    accent: "text-amber-400",
    ring: "ring-amber-500",
  },
  indicacao: {
    bg: "bg-emerald-900/20",
    border: "border-emerald-800/40",
    accent: "text-emerald-400",
    ring: "ring-emerald-500",
  },
};

type AlavancaKey = Alavanca;

export function ImplicacaoFase({ sessao, onConcluir, onRefresh }: Props) {
  const respostasMap: Record<number, boolean> = {};
  const severidadeMap: Record<number, number | null> = {};
  sessao.respostas.forEach((r) => {
    respostasMap[r.perguntaId] = r.resposta;
    severidadeMap[r.perguntaId] = r.severidade;
  });

  const r = sessao.dados ? dinheiroNaMesa(respostasMap, sessao.dados) : null;
  const d = sessao.dados;

  // Alavancas com problema confirmado (>= 1 dor)
  const alavancasComDor = (["recuperacao", "recorrencia", "indicacao"] as const).filter(
    (al) =>
      PERGUNTAS.filter((p) => p.bloco === al).some(
        (p) => respostasMap[p.id] === false
      )
  );

  const [alavancaAtiva, setAlavancaAtiva] = useState<AlavancaKey>(
    alavancasComDor[0] || "recuperacao"
  );
  const [mostrarSegundaCamada, setMostrarSegundaCamada] = useState(false);
  const [mostrarConsolidado, setMostrarConsolidado] = useState(false);
  const [fraseTexto, setFraseTexto] = useState("");

  // Frases de ouro (Situação) + frases problema da alavanca ativa
  const idsAtivos = PERGUNTAS.filter((p) => p.bloco === alavancaAtiva).map(
    (p) => p.id
  );
  const frasesOuroAlav = sessao.frases.filter(
    (f) =>
      f.fase === "situacao" && f.texto.toLowerCase().includes(alavancaAtiva)
  );
  const frasesProblemaAlav = sessao.frases.filter(
    (f) => f.fase === "problema" && idsAtivos.includes(f.perguntaId || -1)
  );

  async function salvarFrase() {
    if (!fraseTexto.trim()) return;
    await fetch(`/api/sessoes/${sessao.id}/frases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fase: "implicacao",
        texto: `[${alavancaAtiva}] ${fraseTexto.trim()}`,
        perguntaId: null,
      }),
    });
    setFraseTexto("");
    onRefresh();
  }

  if (!d || !r) {
    return (
      <div className="p-6 rounded-xl bg-amber-900/20 border border-amber-800/40 text-amber-200">
        Preencha os dados na Fase Situação antes de entrar em Implicação.
      </div>
    );
  }

  if (alavancasComDor.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-amber-900/20 border border-amber-800/40 text-amber-200">
        Nenhum problema confirmado. Volte à Fase Problema para mapear as dores.
      </div>
    );
  }

  // Scripts narrados por alavanca
  const scripts: Record<
    AlavancaKey,
    {
      titulo: string;
      narrativa: React.ReactNode;
      perguntaImplicacao: string;
      segundaCamada: React.ReactNode;
    }
  > = {
    recuperacao: {
      titulo: "🎯 Recuperação — Dinheiro escorrendo dos leads",
      narrativa: (
        <>
          <p className="mb-2">
            <span className="font-bold text-red-300">
              Você me disse que perde aproximadamente {d.atendPerdidos}{" "}
              atendimentos por mês.
            </span>{" "}
            Isso significa{" "}
            <span className="font-bold">{d.atendPerdidos * 12} orçamentos</span>{" "}
            que não viraram venda no ano.
          </p>
          <p className="mb-2">
            Se a gente conseguir recuperar só{" "}
            <span className="font-bold">10%</span> desses — e 10% é
            conservador, a média dos nossos clientes fica em 18% — seriam{" "}
            <span className="font-bold">
              {Math.floor(d.atendPerdidos * 12 * 0.1)} vendas adicionais
            </span>
            .
          </p>
          <p className="mb-2">
            Com seu ticket médio de{" "}
            <span className="font-bold">{brl(d.ticketMedio)}</span>, isso
            representa{" "}
            <span className="font-bold text-red-300">
              {brl(d.atendPerdidos * 12 * 0.1 * d.ticketMedio)}
            </span>{" "}
            de faturamento que está literalmente na mesa.
          </p>
          <p>
            E sua comissão de{" "}
            <span className="font-bold">{d.comissaoPct}%</span>? São{" "}
            <span className="font-bold text-emerald-300">
              {brl(r.recuperacao * 12)}
            </span>{" "}
            a mais por ano no seu bolso.
          </p>
        </>
      ),
      perguntaImplicacao: `Quando você olha pra esse número — ${brl(
        r.recuperacao * 12
      )}/ano — passando pela sua mão e indo embora, como isso te faz sentir em relação ao crescimento que você planejou pro ano?`,
      segundaCamada: (
        <>
          <p>
            <span className="font-bold">Segunda camada (custo do lead queimado):</span>{" "}
            cada um desses leads que sumiu custou{" "}
            <span className="font-bold text-red-300">{brl(d.cpl)}</span> pra
            chegar até você. Você está pagando{" "}
            <span className="font-bold text-red-300">
              {brl(r.desperdicioLeadsMes)}/mês
            </span>{" "}
            em leads que ninguém retoma. É como queimar dinheiro, concorda?
          </p>
        </>
      ),
    },
    recorrencia: {
      titulo: "🔄 Recorrência — Clientes na geladeira",
      narrativa: (
        <>
          <p className="mb-2">
            <span className="font-bold text-amber-300">
              Você tem {d.clientesAtivos} clientes ativos
            </span>{" "}
            na base. Desses,{" "}
            <span className="font-bold">{d.clientesInativos}</span> estão
            inativos há mais de 90 dias.
          </p>
          <p className="mb-2">
            Se a gente abordar esses inativos no momento certo — 6 meses antes
            do aniversário, no período que ele costuma viajar — a taxa de
            conversão de base é 3x maior que lead frio.
          </p>
          <p className="mb-2">
            Se{" "}
            <span className="font-bold">
              15% desses {d.clientesInativos} inativos
            </span>{" "}
            comprarem de novo com ticket de{" "}
            <span className="font-bold">
              {brl(d.ticket2aCompra || d.ticketMedio)}
            </span>
            , são{" "}
            <span className="font-bold text-amber-300">
              {brl(
                d.clientesInativos *
                  0.15 *
                  (d.ticket2aCompra || d.ticketMedio)
              )}
            </span>{" "}
            que voltam sem você gastar 1 centavo em anúncio.
          </p>
          <p>
            Em comissão pra você:{" "}
            <span className="font-bold text-emerald-300">
              {brl(r.recorrencia * 12)}/ano
            </span>
            .
          </p>
        </>
      ),
      perguntaImplicacao: `Esses ${d.clientesInativos} clientes inativos já confiaram em você uma vez. Cada mês que passa sem contato, a chance de perder pra concorrente aumenta. Quantos desses você acha que já foram pra outra agência simplesmente porque ninguém ligou?`,
      segundaCamada: (
        <>
          <p>
            <span className="font-bold">Segunda camada (custo de reposição):</span>{" "}
            adquirir um cliente novo te custa{" "}
            <span className="font-bold text-red-300">
              {brl(d.taxaConversao > 0 ? d.cpl / (d.taxaConversao / 100) : 0)}
            </span>{" "}
            (CAC). Reativar um antigo: praticamente zero. A cada cliente da base
            que vai pro concorrente, você precisa gastar{" "}
            <span className="font-bold text-red-300">
              {brl(r.custoRepoClienteInativo)}
            </span>{" "}
            pra repor. Isso tá no seu radar?
          </p>
        </>
      ),
    },
    indicacao: {
      titulo: "🌱 Indicação — Multiplicador grátis",
      narrativa: (
        <>
          <p className="mb-2">
            <span className="font-bold text-emerald-300">
              Vocês fazem {d.vendasMes} vendas por mês.
            </span>{" "}
            No turismo, o índice natural de indicação — sem programa
            estruturado — fica em torno de <span className="font-bold">5%</span>.
            Ou seja, uns{" "}
            <span className="font-bold">
              {Math.round(d.vendasMes * 0.05)} indicações por mês
            </span>
            .
          </p>
          <p className="mb-2">
            Com programa ativo — abordando o cliente no pós-viagem, na euforia —
            o índice sobe pra <span className="font-bold">22%</span>. Seriam{" "}
            <span className="font-bold">
              {Math.round(d.vendasMes * 0.22)} indicações/mês
            </span>{" "}
            ao invés de {Math.round(d.vendasMes * 0.05)}.
          </p>
          <p className="mb-2">
            Diferença:{" "}
            <span className="font-bold">
              {Math.round(d.vendasMes * (0.22 - 0.05))} leads qualificados
              GRATUITOS por mês
            </span>
            . Com sua taxa de conversão de{" "}
            <span className="font-bold">{d.taxaConversao}%</span>, viram{" "}
            <span className="font-bold">
              {Math.round(
                d.vendasMes * (0.22 - 0.05) * (d.taxaConversao / 100)
              )}{" "}
              vendas adicionais
            </span>{" "}
            no mês.
          </p>
          <p>
            Em comissão:{" "}
            <span className="font-bold text-emerald-300">
              {brl(r.indicacao * 12)}/ano
            </span>{" "}
            — com custo de aquisição ZERO.
          </p>
        </>
      ),
      perguntaImplicacao: `Indicação é o melhor lead que existe — já vem com confiança. Mas se ninguém pede no momento certo, ele esfria. Quantos clientes saíram de viagem felizes no último ano e ninguém aproveitou esse momento pra pedir uma indicação?`,
      segundaCamada: (
        <>
          <p>
            <span className="font-bold">Segunda camada (lead pago vs grátis):</span>{" "}
            seu CPL hoje é{" "}
            <span className="font-bold text-red-300">{brl(d.cpl)}</span>. Lead
            indicado custa <span className="font-bold text-emerald-300">R$ 0</span>{" "}
            E converte 3x mais. A cada indicação que vocês não captam, é{" "}
            <span className="font-bold text-red-300">{brl(d.cpl)}</span> a mais
            em mídia paga pra repor.
          </p>
        </>
      ),
    },
  };

  const script = scripts[alavancaAtiva];
  const style = STYLE[alavancaAtiva];

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Transição */}
      <div className="p-4 rounded-xl bg-orange-900/20 border border-orange-800/40">
        <p className="text-[10px] uppercase tracking-wider text-orange-400 mb-2">
          Transição — leia em voz alta
        </p>
        <p className="text-slate-100 italic leading-relaxed">
          &ldquo;{sessao.prospect?.nome || "Então"}, a gente mapeou{" "}
          {Object.values(respostasMap).filter((v) => v === false).length} pontos
          hoje. Eu queria entender com você o impacto disso. Posso te mostrar
          como eu olho pra esses números?&rdquo;
        </p>
      </div>

      {/* Seletor de alavancas */}
      <div className="flex gap-2 flex-wrap">
        {alavancasComDor.map((al) => {
          const meta = BLOCOS[al];
          const s = STYLE[al];
          const ehAtiva = al === alavancaAtiva;
          return (
            <button
              key={al}
              onClick={() => {
                setAlavancaAtiva(al);
                setMostrarSegundaCamada(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                ehAtiva
                  ? `${s.bg} ${s.border} border-2 ${s.accent}`
                  : "bg-slate-900/40 border border-slate-800 text-slate-400 hover:bg-slate-800"
              }`}
            >
              {meta.emoji} {meta.label}
            </button>
          );
        })}
      </div>

      {/* Simulação narrada */}
      <div className={`p-5 rounded-xl border ${style.bg} ${style.border}`}>
        <p
          className={`text-[10px] uppercase tracking-wider ${style.accent} mb-3`}
        >
          Simulação narrada — leia passo a passo, em voz alta
        </p>
        <h3 className="text-lg font-bold text-slate-100 mb-3">
          {script.titulo}
        </h3>
        <div className="text-slate-100 leading-relaxed space-y-1">
          {script.narrativa}
        </div>
      </div>

      {/* Pergunta de implicação */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <p className="text-[10px] uppercase tracking-wider text-orange-400 mb-2">
          Pergunta de Implicação — pergunte e CALE
        </p>
        <p className="text-lg text-slate-100 italic leading-relaxed font-medium mb-4">
          &ldquo;{script.perguntaImplicacao}&rdquo;
        </p>

        <button
          onClick={() => setMostrarSegundaCamada(!mostrarSegundaCamada)}
          className="px-4 py-2 rounded-lg bg-orange-700 hover:bg-orange-600 text-sm font-medium"
        >
          {mostrarSegundaCamada ? "Esconder" : "Mostrar"} segunda camada
        </button>

        {mostrarSegundaCamada && (
          <div className="mt-4 p-4 rounded-lg bg-red-900/15 border border-red-800/30 text-slate-100 leading-relaxed">
            {script.segundaCamada}
          </div>
        )}
      </div>

      {/* Frases de ouro + frases de problema (espelhar) */}
      {(frasesOuroAlav.length > 0 || frasesProblemaAlav.length > 0) && (
        <div className="p-4 rounded-xl bg-amber-900/10 border border-amber-800/30">
          <p className="text-[10px] uppercase tracking-wider text-amber-400 mb-2">
            🏆 Frases dele — espelhe ANTES do número
          </p>
          <p className="text-xs text-slate-500 mb-3">
            Padrão: &ldquo;Você mesmo me disse que [frase dele]. E isso custa
            R$ X por mês&hellip;&rdquo;
          </p>
          <div className="space-y-1">
            {[...frasesOuroAlav, ...frasesProblemaAlav].map((f) => (
              <p
                key={f.id}
                className="text-xs text-amber-200 italic pl-3 border-l-2 border-amber-500/50"
              >
                &ldquo;{f.texto.replace(/^\[\w+\]\s*/, "")}&rdquo;
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Capturar reação */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-2">
          Capture a reação dele ao número (vai usar no fechamento)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={fraseTexto}
            onChange={(e) => setFraseTexto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && salvarFrase()}
            placeholder={`ex: "caramba, não tinha noção que era tanto"`}
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

      {/* Consolidação dos 3 (botão) */}
      <div>
        <button
          onClick={() => setMostrarConsolidado(!mostrarConsolidado)}
          className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-red-900/40 via-amber-900/40 to-emerald-900/40 border border-slate-700 text-slate-100 font-medium hover:from-red-900/60 hover:via-amber-900/60 hover:to-emerald-900/60"
        >
          {mostrarConsolidado ? "▼" : "▶"} Mostrar consolidado das 3 alavancas
        </button>

        {mostrarConsolidado && (
          <div className="mt-3 p-5 rounded-xl bg-slate-900/80 border border-slate-700 space-y-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              Leia em voz alta — &ldquo;Olha o cenário completo&rdquo;
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-baseline">
                <span className="text-red-300">🎯 Recuperação</span>
                <span className="font-bold text-red-300 tabular-nums">
                  +{brl(r.recuperacao)}/mês
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-amber-300">🔄 Recorrência</span>
                <span className="font-bold text-amber-300 tabular-nums">
                  +{brl(r.recorrencia)}/mês
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-emerald-300">🌱 Indicação</span>
                <span className="font-bold text-emerald-300 tabular-nums">
                  +{brl(r.indicacao)}/mês
                </span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between items-baseline">
                <span className="text-slate-100 font-bold">TOTAL</span>
                <span className="font-bold text-2xl text-emerald-300 tabular-nums">
                  +{brl(r.totalMes)}/mês
                </span>
              </div>
              <div className="text-right text-sm text-emerald-400">
                → {brl(r.totalAno)}/ano
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700 grid grid-cols-3 gap-3 text-center text-xs">
              <div>
                <p className="text-slate-500">Por dia parado</p>
                <p className="font-bold text-red-300 text-lg">
                  -{brl(r.perDay)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Carros populares/ano</p>
                <p className="font-bold text-slate-200 text-lg">
                  {Math.floor(r.totalAno / 90000)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Viagens internacionais</p>
                <p className="font-bold text-slate-200 text-lg">
                  {Math.floor(r.totalAno / 15000)}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700">
              <p className="text-[10px] uppercase tracking-wider text-orange-400 mb-2">
                Pergunta final de implicação
              </p>
              <p className="text-slate-100 italic">
                &ldquo;Se daqui a 12 meses você olhar pra trás e perceber que
                deixou {brl(r.totalAno)} na mesa&hellip; como isso vai te fazer
                sentir?&rdquo;
              </p>
            </div>
          </div>
        )}
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
