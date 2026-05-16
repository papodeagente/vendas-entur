"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { FASES, FASES_MAP, FaseKey } from "@/lib/fases";
import { AberturaFase } from "@/components/fases/AberturaFase";
import { SituacaoFase } from "@/components/fases/SituacaoFase";
import { ProblemaFase } from "@/components/fases/ProblemaFase";
import { ImplicacaoFase } from "@/components/fases/ImplicacaoFase";
import { NeedPayoffFase } from "@/components/fases/NeedPayoffFase";
import { FechamentoFase } from "@/components/fases/FechamentoFase";
import { PainelCoach } from "@/components/coach/PainelCoach";
import { DinheiroAcumulado } from "@/components/coach/DinheiroAcumulado";
import { EnturLogo } from "@/components/EnturLogo";
import { AgenciaBuenosAiresAoVivo } from "@/components/playbooks/AgenciaBuenosAiresAoVivo";
import { MODELO_AGENCIA_BUENOS_AIRES } from "@/lib/modelosSpin";

export interface SessaoAoVivo {
  id: number;
  modeloSpin: string;
  agenciaNome: string;
  vendedorNome: string;
  status: string;
  comercialStatus: string;
  ctaEscolhido: string | null;
  precoCrmMes: number | null;
  valorMesaMes: number | null;
  valorMesaAno: number | null;
  followUpEm: string | null;
  observacaoFechamento: string | null;
  perguntasJson: string | null;
  pacoteId: number | null;
  pacote: {
    id: number;
    nome: string;
    destino: string;
    valorTotal: number;
    moeda: string;
  } | null;
  respostas: { perguntaId: number; resposta: boolean; severidade: number | null }[];
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
  prospect: {
    nome: string;
    cargo: string | null;
    tamanhoEquipe: number | null;
    email: string | null;
    whatsapp: string | null;
  } | null;
  frases: { id: number; fase: string; texto: string; perguntaId: number | null; createdAt: string }[];
  progresso: { fase: string; iniciadaEm: string | null; concluidaEm: string | null }[];
}

export default function SessaoAoVivoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [sessao, setSessao] = useState<SessaoAoVivo | null>(null);
  const [faseAtiva, setFaseAtiva] = useState<FaseKey>("abertura");
  const [loading, setLoading] = useState(true);

  const carregarSessao = useCallback(async () => {
    const res = await fetch(`/api/sessoes/${id}`);
    const data = await res.json();
    setSessao(data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    let ativo = true;
    fetch(`/api/sessoes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ativo) return;
        setSessao(data);
        setLoading(false);
      });
    return () => {
      ativo = false;
    };
  }, [id]);

  // Marca fase como iniciada quando o vendedor muda para ela
  useEffect(() => {
    if (!sessao) return;
    if (sessao.modeloSpin === MODELO_AGENCIA_BUENOS_AIRES) return;
    fetch(`/api/sessoes/${id}/progresso`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fase: faseAtiva, acao: "iniciar" }),
    });
  }, [faseAtiva, id, sessao]);

  async function concluirFase(fase: FaseKey, proxima: FaseKey) {
    await fetch(`/api/sessoes/${id}/progresso`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fase, acao: "concluir" }),
    });
    setFaseAtiva(proxima);
    carregarSessao();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Carregando sessão ao vivo...</p>
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

  const progressoMap: Record<string, { iniciada: boolean; concluida: boolean }> = {};
  sessao.progresso.forEach((p) => {
    progressoMap[p.fase] = {
      iniciada: !!p.iniciadaEm,
      concluida: !!p.concluidaEm,
    };
  });

  const faseAtivaMeta = FASES_MAP[faseAtiva];

  if (sessao.modeloSpin === MODELO_AGENCIA_BUENOS_AIRES) {
    return (
      <AgenciaBuenosAiresAoVivo
        sessao={sessao}
        onRefresh={carregarSessao}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-sm px-6 py-3">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center">
              <EnturLogo size="sm" />
            </Link>
            <div className="h-5 w-px bg-slate-800" />
            <div>
              <Link href="/" className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">
                ← sessões
              </Link>
              <h1 className="text-sm font-semibold">
                {sessao.agenciaNome}
                <span className="text-slate-500 font-normal ml-2">
                  · {sessao.vendedorNome}
                </span>
              </h1>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r from-[#FF1744]/10 to-[#AA00FF]/10 border border-purple-500/20 text-purple-300">
            SPIN Ao Vivo
          </span>
        </div>
      </header>

      <div className="flex max-w-[1600px] mx-auto">
        {/* Sidebar esquerda: stepper vertical */}
        <aside className="w-56 shrink-0 border-r border-slate-800 px-4 py-6 sticky top-0 h-screen overflow-y-auto">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-4 px-2">
            Fases
          </p>
          <nav className="flex flex-col gap-1">
            {FASES.map((f) => {
              const isActive = faseAtiva === f.key;
              const p = progressoMap[f.key];
              const concluida = p?.concluida;
              return (
                <button
                  key={f.key}
                  onClick={() => setFaseAtiva(f.key)}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : concluida
                      ? "text-emerald-400 hover:bg-slate-800"
                      : "text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs w-5 h-5 rounded-full flex items-center justify-center ${
                        isActive
                          ? "bg-white/20"
                          : concluida
                          ? "bg-emerald-500/20"
                          : "bg-slate-800"
                      }`}
                    >
                      {concluida && !isActive ? "✓" : f.num}
                    </span>
                    <span className="font-medium">{f.label}</span>
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 ml-7 ${
                      isActive ? "text-white/70" : "text-slate-500"
                    }`}
                  >
                    {f.duracaoMin} min · {f.subtitulo}
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Área principal */}
        <main className="flex-1 px-8 py-6 pb-32 min-w-0">
          <div className="mb-6">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Fase {faseAtivaMeta.num}
              </span>
            </div>
            <h2 className="text-2xl font-bold">{faseAtivaMeta.label}</h2>
            <p className="text-slate-400 text-sm">{faseAtivaMeta.subtitulo}</p>
          </div>

          {faseAtiva === "abertura" && (
            <AberturaFase
              sessao={sessao}
              onConcluir={() => concluirFase("abertura", "situacao")}
              onRefresh={carregarSessao}
            />
          )}
          {faseAtiva === "situacao" && (
            <SituacaoFase
              sessao={sessao}
              onConcluir={() => concluirFase("situacao", "problema")}
              onRefresh={carregarSessao}
            />
          )}
          {faseAtiva === "problema" && (
            <ProblemaFase
              sessao={sessao}
              onConcluir={() => concluirFase("problema", "implicacao")}
              onRefresh={carregarSessao}
            />
          )}
          {faseAtiva === "implicacao" && (
            <ImplicacaoFase
              sessao={sessao}
              onConcluir={() => concluirFase("implicacao", "needPayoff")}
              onRefresh={carregarSessao}
            />
          )}
          {faseAtiva === "needPayoff" && (
            <NeedPayoffFase
              sessao={sessao}
              onConcluir={() => concluirFase("needPayoff", "fechamento")}
              onRefresh={carregarSessao}
            />
          )}
          {faseAtiva === "fechamento" && (
            <FechamentoFase sessao={sessao} onRefresh={carregarSessao} />
          )}
        </main>

        {/* Painel lateral direito: Coach */}
        <aside className="w-80 shrink-0 border-l border-slate-800 px-5 py-6 sticky top-0 h-screen overflow-y-auto">
          <PainelCoach
            faseAtiva={faseAtiva}
            sessao={sessao}
            respostas={respostasMap}
          />
        </aside>
      </div>

      {/* Rodapé fixo: Dinheiro na Mesa (só a partir da Implicação) */}
      {(faseAtiva === "implicacao" ||
        faseAtiva === "needPayoff" ||
        faseAtiva === "fechamento") &&
        sessao.dados && (
          <DinheiroAcumulado respostas={respostasMap} dados={sessao.dados} />
        )}
    </div>
  );
}
