"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

interface DashboardData {
  resumo: {
    sessoes: number;
    completas: number;
    comCta: number;
    ganhas: number;
    perdidas: number;
    totalValorMesaMes: number;
    ticketMedioMesa: number;
  };
  porStatus: { key: string; label: string; total: number }[];
  porVendedor: {
    vendedor: string;
    email: string | null;
    sessoes: number;
    valorMesaMes: number;
    ganhas: number;
    propostas: number;
  }[];
  recentes: {
    id: number;
    agenciaNome: string;
    vendedorNome: string;
    prospectNome: string | null;
    comercialStatus: string;
    ctaEscolhido: string | null;
    valorMesaMes: number | null;
    followUpEm: string | null;
    createdAt: string;
  }[];
}

function brl(n: number) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

const statusClass: Record<string, string> = {
  nova: "bg-slate-800 text-slate-300",
  diagnostico: "bg-sky-900/40 text-sky-300",
  demo: "bg-indigo-900/40 text-indigo-300",
  proposta: "bg-purple-900/40 text-purple-300",
  piloto: "bg-amber-900/40 text-amber-300",
  negociacao: "bg-orange-900/40 text-orange-300",
  ganho: "bg-emerald-900/40 text-emerald-300",
  perdido: "bg-red-900/40 text-red-300",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-10 text-slate-400">
          Carregando dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-purple-300 mb-2">
            Gestão comercial
          </p>
          <h1 className="text-3xl font-bold">Dashboard SPIN Entur OS</h1>
          <p className="text-slate-400 mt-1">
            Sessões, dinheiro na mesa e próximos passos do time comercial.
          </p>
        </div>

        <section className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Card label="Sessões" value={String(data.resumo.sessoes)} />
          <Card label="Completas" value={String(data.resumo.completas)} />
          <Card label="Com CTA" value={String(data.resumo.comCta)} />
          <Card label="Ganhas" value={String(data.resumo.ganhas)} accent="emerald" />
          <Card label="Perdidas" value={String(data.resumo.perdidas)} accent="red" />
          <Card label="Mesa/mês" value={brl(data.resumo.totalValorMesaMes)} accent="purple" />
        </section>

        <section className="grid lg:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <h2 className="font-semibold mb-4">Funil por status</h2>
            <div className="space-y-2">
              {data.porStatus.map((s) => (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-slate-400">{s.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF1744] to-[#AA00FF]"
                      style={{
                        width: `${data.resumo.sessoes ? (s.total / data.resumo.sessoes) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-semibold">{s.total}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <h2 className="font-semibold mb-4">Performance por vendedor</h2>
            <div className="space-y-3">
              {data.porVendedor.length === 0 && (
                <p className="text-sm text-slate-500">Sem sessões ainda.</p>
              )}
              {data.porVendedor.map((v) => (
                <div key={v.email || v.vendedor} className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{v.vendedor}</p>
                      <p className="text-xs text-slate-500">{v.email || "sem login vinculado"}</p>
                    </div>
                    <p className="text-sm text-purple-300 font-semibold">{brl(v.valorMesaMes)}/mês</p>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-slate-400">
                    <span>{v.sessoes} sessões</span>
                    <span>{v.propostas} propostas/negociações</span>
                    <span className="text-emerald-400">{v.ganhas} ganhas</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="font-semibold mb-4">Sessões recentes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="text-left py-2">Agência</th>
                  <th className="text-left py-2">Vendedor</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">CTA</th>
                  <th className="text-right py-2">Mesa/mês</th>
                  <th className="text-right py-2">Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {data.recentes.map((s) => (
                  <tr key={s.id} className="border-b border-slate-800/60">
                    <td className="py-3">
                      <Link href={`/sessao/${s.id}/ao-vivo`} className="text-slate-100 hover:text-purple-300">
                        {s.agenciaNome}
                      </Link>
                      {s.prospectNome && <p className="text-xs text-slate-500">{s.prospectNome}</p>}
                    </td>
                    <td className="py-3 text-slate-400">{s.vendedorNome}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${statusClass[s.comercialStatus] || statusClass.nova}`}>
                        {s.comercialStatus}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{s.ctaEscolhido || "—"}</td>
                    <td className="py-3 text-right text-emerald-300">{brl(s.valorMesaMes || 0)}</td>
                    <td className="py-3 text-right text-slate-400">
                      {s.followUpEm ? new Date(s.followUpEm).toLocaleDateString("pt-BR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function Card({
  label,
  value,
  accent = "slate",
}: {
  label: string;
  value: string;
  accent?: "slate" | "emerald" | "red" | "purple";
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-300"
      : accent === "red"
      ? "text-red-300"
      : accent === "purple"
      ? "text-purple-300"
      : "text-slate-100";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
