"use client";

import { useEffect, useState, use } from "react";
import { DiagnosticoTab } from "@/components/tabs/DiagnosticoTab";
import { DadosTab } from "@/components/tabs/DadosTab";
import { DinheiroTab } from "@/components/tabs/DinheiroTab";
import { PlanoTab } from "@/components/tabs/PlanoTab";

const ABAS = [
  { key: "diagnostico", label: "Diagnóstico", num: 1 },
  { key: "dados", label: "Dados", num: 2 },
  { key: "dinheiro", label: "Dinheiro na Mesa", num: 3 },
  { key: "plano", label: "Plano de Ação", num: 4 },
];

interface Sessao {
  id: number;
  agenciaNome: string;
  vendedorNome: string;
  status: string;
  respostas: { perguntaId: number; resposta: boolean }[];
  dados: {
    vendasMes: number;
    ticketMedio: number;
    comissaoPct: number;
    atendPerdidos: number;
    clientesAtivos: number;
    clientesInativos: number;
    indicacoesMes: number;
    taxaConversao: number;
    tempoRecompra: number;
    cpl: number;
    ticket2aCompra: number;
    historicoMeses: number;
  } | null;
  planoAcoes: { acaoId: number; concluida: boolean }[];
}

export default function SessaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [abaAtiva, setAbaAtiva] = useState("diagnostico");
  const [loading, setLoading] = useState(true);

  async function carregarSessao() {
    const res = await fetch(`/api/sessoes/${id}`);
    const data = await res.json();
    setSessao(data);
    setLoading(false);
  }

  useEffect(() => {
    carregarSessao();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Carregando sessão...</p>
      </div>
    );
  }

  if (!sessao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-red-400">Sessão não encontrada</p>
      </div>
    );
  }

  const respostasMap: Record<number, boolean> = {};
  sessao.respostas.forEach((r) => {
    respostasMap[r.perguntaId] = r.resposta;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <a href="/" className="text-slate-500 hover:text-slate-300 text-sm mb-2 inline-block">
            ← Voltar
          </a>
          <h1 className="text-2xl font-bold text-white">{sessao.agenciaNome}</h1>
          <p className="text-slate-400">Vendedor: {sessao.vendedorNome}</p>
        </div>

        {/* Stepper */}
        <div className="flex mb-8 gap-1">
          {ABAS.map((aba) => {
            const isActive = abaAtiva === aba.key;
            const abaIndex = ABAS.findIndex((a) => a.key === aba.key);
            const activeIndex = ABAS.findIndex((a) => a.key === abaAtiva);
            const isPast = abaIndex < activeIndex;

            return (
              <button
                key={aba.key}
                onClick={() => setAbaAtiva(aba.key)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                    : isPast
                    ? "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                <span className="mr-2">{aba.num}.</span>
                {aba.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {abaAtiva === "diagnostico" && (
          <DiagnosticoTab
            sessaoId={sessao.id}
            respostas={respostasMap}
            onSaved={carregarSessao}
            onNext={() => setAbaAtiva("dados")}
          />
        )}
        {abaAtiva === "dados" && (
          <DadosTab
            sessaoId={sessao.id}
            dados={sessao.dados}
            onSaved={carregarSessao}
            onNext={() => setAbaAtiva("dinheiro")}
          />
        )}
        {abaAtiva === "dinheiro" && (
          <DinheiroTab
            respostas={respostasMap}
            dados={sessao.dados}
            onNext={() => setAbaAtiva("plano")}
          />
        )}
        {abaAtiva === "plano" && (
          <PlanoTab
            respostas={respostasMap}
            dados={sessao.dados}
          />
        )}
      </div>
    </div>
  );
}
