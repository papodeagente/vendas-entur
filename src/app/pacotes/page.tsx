"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

interface Pacote {
  id: number;
  nome: string;
  destino: string;
  tipo: string;
  duracaoDias: number;
  valorTotal: number;
  moeda: string;
  personaAlvo: string;
  createdBy: { nome: string };
  createdAt: string;
}

const TIPO_BADGE: Record<string, string> = {
  praia: "bg-sky-900/40 text-sky-300",
  aventura: "bg-orange-900/40 text-orange-300",
  cultural: "bg-purple-900/40 text-purple-300",
  romance: "bg-pink-900/40 text-pink-300",
  familia: "bg-emerald-900/40 text-emerald-300",
  luxo: "bg-amber-900/40 text-amber-300",
  outro: "bg-slate-700 text-slate-300",
};

function brl(n: number, moeda: string) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: moeda || "BRL",
    maximumFractionDigits: 0,
  });
}

export default function PacotesPage() {
  const [pacotes, setPacotes] = useState<Pacote[]>([]);

  useEffect(() => {
    fetch("/api/pacotes")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPacotes);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Pacotes</h1>
            <p className="text-sm text-slate-400">
              Cadastre os pacotes que vende. O sistema gera SPIN personalizado por pacote via IA.
            </p>
          </div>
          <Link
            href="/pacotes/novo"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm"
          >
            + Novo pacote
          </Link>
        </div>

        {pacotes.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-10 text-center">
            <p className="text-slate-400 mb-3">Nenhum pacote cadastrado ainda.</p>
            <Link
              href="/pacotes/novo"
              className="inline-block px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
            >
              Cadastrar primeiro pacote
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pacotes.map((p) => (
              <Link
                key={p.id}
                href={`/pacotes/${p.id}`}
                className="block bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-emerald-700 transition"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">{p.nome}</h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded uppercase ${
                      TIPO_BADGE[p.tipo] || TIPO_BADGE.outro
                    }`}
                  >
                    {p.tipo}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-2">{p.destino}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{p.duracaoDias} dias</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">
                    {brl(p.valorTotal, p.moeda)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-3 italic">
                  {p.personaAlvo}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
