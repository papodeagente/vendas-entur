"use client";

import { useState } from "react";
import type { SessaoAoVivo } from "@/app/sessao/[id]/ao-vivo/page";

interface Props {
  sessao: SessaoAoVivo;
  onConcluir: () => void;
  onRefresh: () => void;
}

const PERGUNTAS_ABERTAS = [
  "Me conta como funciona hoje a captação de leads de vocês? De onde eles vêm?",
  "Quantas vendas vocês fecham por mês, em média? Qual o ticket médio?",
  "Como a equipe comercial está estruturada hoje? Quantos vendedores, pré-vendas, SDRs?",
  "Quantos atendimentos passam pela equipe que acabam não virando venda?",
];

interface CampoNumerico {
  key: keyof DadosLocal;
  label: string;
  placeholder: string;
  sufixo?: string;
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
  { key: "vendasMes", label: "Vendas por mês", placeholder: "ex: 40" },
  { key: "ticketMedio", label: "Ticket médio (R$)", placeholder: "ex: 3500" },
  { key: "comissaoPct", label: "Comissão (%)", placeholder: "ex: 10", sufixo: "%" },
  { key: "atendPerdidos", label: "Atendimentos perdidos/mês", placeholder: "ex: 80" },
  { key: "clientesAtivos", label: "Clientes ativos na base", placeholder: "ex: 500" },
  { key: "clientesInativos", label: "Clientes inativos (90+ dias)", placeholder: "ex: 200" },
  { key: "indicacoesMes", label: "Indicações/mês", placeholder: "ex: 3" },
  { key: "taxaConversao", label: "Taxa de conversão (%)", placeholder: "ex: 15", sufixo: "%" },
  { key: "tempoRecompra", label: "Tempo médio de recompra (meses)", placeholder: "ex: 12" },
  { key: "cpl", label: "CPL — custo por lead (R$)", placeholder: "ex: 80" },
  { key: "ticket2aCompra", label: "Ticket da 2ª compra (R$)", placeholder: "ex: 4000" },
  { key: "historicoMeses", label: "Meses de histórico", placeholder: "ex: 12" },
];

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

  const preenchidos = Object.values(dados).filter((v) => v && Number(v) > 0).length;
  const podeAvancar = preenchidos >= 7 && !!sessao.dados;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Perguntas abertas */}
      <div className="p-5 rounded-xl bg-sky-900/20 border border-sky-800/40">
        <p className="text-[10px] uppercase tracking-wider text-sky-400 mb-3">
          Perguntas abertas — leia em voz alta, uma de cada vez
        </p>
        <ol className="space-y-2 list-decimal list-inside text-slate-100">
          {PERGUNTAS_ABERTAS.map((p, i) => (
            <li key={i} className="leading-relaxed">
              {p}
            </li>
          ))}
        </ol>
        <p className="text-[11px] text-sky-300/60 mt-3 italic">
          Regra: escute. Não comente. Não compare com benchmark agora. Só registre.
        </p>
      </div>

      {/* Captura numérica inline */}
      <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800">
        <h3 className="font-semibold mb-1">
          Registre enquanto ele fala
          <span className="text-xs text-slate-500 font-normal ml-2">
            {preenchidos}/12 campos
          </span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Não precisa ser exato. Arredonde. O importante é o vendedor ouvir — não te ver digitando.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CAMPOS.map((c) => (
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
          onClick={salvar}
          disabled={salvando}
          className="mt-4 px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-sm disabled:opacity-40"
        >
          {salvando ? "Salvando..." : "Salvar dados"}
        </button>
      </div>

      <div className="flex justify-end">
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
