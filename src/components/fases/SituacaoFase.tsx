"use client";

import { useState } from "react";
import type { SessaoAoVivo } from "@/app/sessao/[id]/ao-vivo/page";

interface Props {
  sessao: SessaoAoVivo;
  onConcluir: () => void;
  onRefresh: () => void;
}

interface PerguntaSituacao {
  alavanca: "recuperacao" | "recorrencia" | "indicacao" | "geral";
  texto: string;
  hint: string;
}

const PERGUNTAS_ABERTAS: PerguntaSituacao[] = [
  {
    alavanca: "recorrencia",
    texto:
      "Me conta: quando um cliente fecha uma viagem com vocês, o que acontece depois? Vocês têm algum contato programado pra oferecer a próxima viagem?",
    hint: "Mapeia RECORRÊNCIA — escute se ele fala em automação, datas, processo",
  },
  {
    alavanca: "geral",
    texto:
      "Quantas vendas vocês fazem por mês e qual o ticket médio? E dessas vendas, quantas são de clientes que já compraram antes?",
    hint: "Volume + diferencia venda nova vs. recompra (RECORRÊNCIA implícita)",
  },
  {
    alavanca: "recuperacao",
    texto:
      "Dos atendimentos que não viram venda — aquele lead que pediu orçamento mas sumiu — vocês têm algum processo pra retomar contato?",
    hint: "Mapeia RECUPERAÇÃO — capture frase exata sobre o que acontece com lead frio",
  },
  {
    alavanca: "indicacao",
    texto:
      "Vocês pedem indicação de forma ativa? Tipo, depois que o cliente volta de viagem satisfeito, existe algum processo pra pedir que ele indique amigos?",
    hint: "Mapeia INDICAÇÃO — escute se é estruturado ou aleatório",
  },
];

interface CampoNumerico {
  key: keyof DadosLocal;
  label: string;
  placeholder: string;
  essencial: boolean;
}

interface DadosLocal {
  vendasMes: string;
  ticketMedio: string;
  comissaoPct: string;
  atendPerdidos: string;
  clientesAtivos: string;
  clientesInativos: string;
  indicacoesMes: string;
  taxaConversao: string;
  tempoRecompra: string;
  cpl: string;
  ticket2aCompra: string;
  historicoMeses: string;
}

const CAMPOS: CampoNumerico[] = [
  { key: "vendasMes", label: "Vendas/mês", placeholder: "ex: 40", essencial: true },
  { key: "ticketMedio", label: "Ticket médio (R$)", placeholder: "ex: 3500", essencial: true },
  { key: "comissaoPct", label: "Comissão (%)", placeholder: "ex: 10", essencial: true },
  { key: "atendPerdidos", label: "Atendimentos perdidos/mês", placeholder: "ex: 80", essencial: true },
  { key: "clientesAtivos", label: "Clientes ativos na base", placeholder: "ex: 500", essencial: true },
  { key: "clientesInativos", label: "Inativos (90+ dias)", placeholder: "ex: 200", essencial: true },
  { key: "cpl", label: "CPL (R$)", placeholder: "ex: 80", essencial: false },
  { key: "ticket2aCompra", label: "Ticket 2ª compra (R$)", placeholder: "ex: 4000", essencial: false },
  { key: "indicacoesMes", label: "Indicações/mês", placeholder: "ex: 3", essencial: false },
  { key: "taxaConversao", label: "Conversão (%)", placeholder: "ex: 15", essencial: false },
  { key: "tempoRecompra", label: "Recompra (meses)", placeholder: "ex: 12", essencial: false },
  { key: "historicoMeses", label: "Histórico (meses)", placeholder: "ex: 12", essencial: false },
];

const ESSENCIAIS_COUNT = CAMPOS.filter((c) => c.essencial).length;

export function SituacaoFase({ sessao, onConcluir, onRefresh }: Props) {
  const d = sessao.dados;
  const [dados, setDados] = useState<DadosLocal>({
    vendasMes: d?.vendasMes?.toString() || "",
    ticketMedio: d?.ticketMedio?.toString() || "",
    comissaoPct: d?.comissaoPct?.toString() || "",
    atendPerdidos: d?.atendPerdidos?.toString() || "",
    clientesAtivos: d?.clientesAtivos?.toString() || "",
    clientesInativos: d?.clientesInativos?.toString() || "",
    indicacoesMes: d?.indicacoesMes?.toString() || "",
    taxaConversao: d?.taxaConversao?.toString() || "",
    tempoRecompra: d?.tempoRecompra?.toString() || "",
    cpl: d?.cpl?.toString() || "",
    ticket2aCompra: d?.ticket2aCompra?.toString() || "",
    historicoMeses: d?.historicoMeses?.toString() || "12",
  });
  const [salvando, setSalvando] = useState(false);
  const [mostrarComplementares, setMostrarComplementares] = useState(false);

  // Captura "frase de ouro" por alavanca
  const [fraseOuro, setFraseOuro] = useState("");
  const [alavancaFrase, setAlavancaFrase] = useState<
    "recuperacao" | "recorrencia" | "indicacao"
  >("recuperacao");

  async function salvar() {
    setSalvando(true);
    const payload = Object.fromEntries(
      Object.entries(dados).map(([k, v]) => [k, Number(v) || 0])
    );
    await fetch(`/api/sessoes/${sessao.id}/dados`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSalvando(false);
    onRefresh();
  }

  async function salvarFraseOuro() {
    if (!fraseOuro.trim()) return;
    await fetch(`/api/sessoes/${sessao.id}/frases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fase: "situacao",
        texto: `[${alavancaFrase}] ${fraseOuro.trim()}`,
        perguntaId: null,
      }),
    });
    setFraseOuro("");
    onRefresh();
  }

  const essenciaisPreenchidos = CAMPOS.filter(
    (c) => c.essencial && dados[c.key] && Number(dados[c.key]) > 0
  ).length;
  const podeAvancar = essenciaisPreenchidos >= ESSENCIAIS_COUNT && !!sessao.dados;

  const frasesOuro = sessao.frases.filter((f) => f.fase === "situacao");

  const corAlavanca: Record<string, string> = {
    recuperacao: "bg-red-900/20 border-red-800/40 text-red-300",
    recorrencia: "bg-amber-900/20 border-amber-800/40 text-amber-300",
    indicacao: "bg-emerald-900/20 border-emerald-800/40 text-emerald-300",
    geral: "bg-sky-900/20 border-sky-800/40 text-sky-300",
  };

  const labelAlavanca: Record<string, string> = {
    recuperacao: "🎯 Recuperação",
    recorrencia: "🔄 Recorrência",
    indicacao: "🌱 Indicação",
    geral: "📊 Volume",
  };

  return (
    <div className="space-y-5 max-w-5xl">
      {/* 4 Perguntas abertas direcionadas às alavancas */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <p className="text-[10px] uppercase tracking-wider text-sky-400 mb-1">
          Perguntas abertas — leia em voz alta, uma de cada vez
        </p>
        <p className="text-[11px] text-slate-500 italic mb-4">
          Escute. Não comente. Não compare com benchmark agora. Capture frases.
        </p>
        <div className="space-y-3">
          {PERGUNTAS_ABERTAS.map((p, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${corAlavanca[p.alavanca]}`}
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider opacity-80">
                  {i + 1}. {labelAlavanca[p.alavanca]}
                </span>
              </div>
              <p className="text-slate-100 leading-relaxed italic mb-1.5">
                &ldquo;{p.texto}&rdquo;
              </p>
              <p className="text-[11px] opacity-70">{p.hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Frase de ouro — captura inline */}
      <div className="p-5 rounded-xl bg-amber-900/10 border border-amber-800/30">
        <p className="text-[10px] uppercase tracking-wider text-amber-400 mb-2">
          🏆 Frase de Ouro — capture as palavras EXATAS dele
        </p>
        <p className="text-xs text-slate-400 mb-3">
          Toda vez que ele soltar uma frase reveladora ({"\""}a gente perde
          muito{"\""}, {"\""}não tenho tempo pra isso{"\""}), salve. Vai usar como
          munição na Implicação.
        </p>
        <div className="flex gap-2 mb-3">
          {(["recuperacao", "recorrencia", "indicacao"] as const).map((al) => (
            <button
              key={al}
              onClick={() => setAlavancaFrase(al)}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                alavancaFrase === al
                  ? "bg-amber-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {labelAlavanca[al]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={fraseOuro}
            onChange={(e) => setFraseOuro(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && salvarFraseOuro()}
            placeholder={`ex: "a gente já perdeu cliente assim várias vezes"`}
            className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={salvarFraseOuro}
            disabled={!fraseOuro.trim()}
            className="px-3 py-2 rounded bg-amber-600 hover:bg-amber-500 text-sm disabled:opacity-40"
          >
            + Salvar frase
          </button>
        </div>
        {frasesOuro.length > 0 && (
          <div className="mt-3 pt-3 border-t border-amber-800/30 space-y-1">
            {frasesOuro.map((f) => (
              <p
                key={f.id}
                className="text-xs text-amber-200 italic pl-3 border-l-2 border-amber-500/50"
              >
                &ldquo;{f.texto}&rdquo;
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Campos numéricos — essenciais primeiro */}
      <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800">
        <h3 className="font-semibold mb-1">
          Registre enquanto ele fala
          <span className="text-xs text-slate-500 font-normal ml-2">
            {essenciaisPreenchidos}/{ESSENCIAIS_COUNT} essenciais
          </span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Arredonde. O importante é o vendedor ouvir — não te ver digitando.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CAMPOS.filter((c) => c.essencial).map((c) => (
            <div key={c.key}>
              <label className="text-[11px] text-slate-400 block mb-1">
                {c.label}
              </label>
              <input
                type="number"
                value={dados[c.key]}
                onChange={(e) =>
                  setDados({ ...dados, [c.key]: e.target.value })
                }
                placeholder={c.placeholder}
                className="w-full px-2.5 py-1.5 text-sm rounded bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => setMostrarComplementares(!mostrarComplementares)}
          className="mt-4 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          {mostrarComplementares ? "− Esconder" : "+ Mostrar"} campos
          complementares (CPL, ticket 2ª compra, conversão...)
        </button>

        {mostrarComplementares && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
            {CAMPOS.filter((c) => !c.essencial).map((c) => (
              <div key={c.key}>
                <label className="text-[11px] text-slate-500 block mb-1">
                  {c.label}
                </label>
                <input
                  type="number"
                  value={dados[c.key]}
                  onChange={(e) =>
                    setDados({ ...dados, [c.key]: e.target.value })
                  }
                  placeholder={c.placeholder}
                  className="w-full px-2.5 py-1.5 text-sm rounded bg-slate-800/60 border border-slate-700 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={salvar}
          disabled={salvando}
          className="mt-4 px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-sm disabled:opacity-40"
        >
          {salvando ? "Salvando..." : "Salvar dados"}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {!podeAvancar
            ? `Preencha os ${ESSENCIAIS_COUNT} campos essenciais (${essenciaisPreenchidos}/${ESSENCIAIS_COUNT}).`
            : "Pronto. Pode entrar na fase Problema."}
        </p>
        <button
          onClick={onConcluir}
          disabled={!podeAvancar}
          className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
        >
          Começar Problema →
        </button>
      </div>
    </div>
  );
}
