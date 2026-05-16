"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

const TIPOS = [
  { v: "praia", l: "Praia" },
  { v: "aventura", l: "Aventura" },
  { v: "cultural", l: "Cultural" },
  { v: "romance", l: "Romance" },
  { v: "familia", l: "Família" },
  { v: "luxo", l: "Luxo" },
  { v: "outro", l: "Outro" },
];

export default function NovoPacotePage() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [destino, setDestino] = useState("");
  const [tipo, setTipo] = useState("praia");
  const [duracaoDias, setDuracaoDias] = useState("7");
  const [valorTotal, setValorTotal] = useState("");
  const [moeda, setMoeda] = useState("BRL");
  const [personaAlvo, setPersonaAlvo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [diferenciais, setDiferenciais] = useState("");
  const [objecoesComuns, setObjecoesComuns] = useState("");

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    const res = await fetch("/api/pacotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        destino,
        tipo,
        duracaoDias: Number(duracaoDias),
        valorTotal: Number(valorTotal),
        moeda,
        personaAlvo,
        descricao,
        diferenciais: diferenciais || null,
        objecoesComuns: objecoesComuns || null,
      }),
    });
    setSalvando(false);
    if (!res.ok) {
      const d = await res.json();
      setErro(d.error || "Erro ao salvar");
      return;
    }
    const p = await res.json();
    router.push(`/pacotes/${p.id}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <form onSubmit={salvar} className="max-w-3xl mx-auto px-6 py-10 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Novo pacote</h1>
          <p className="text-sm text-slate-400">
            Quanto mais detalhe você der, melhor a IA gerará o SPIN.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Nome do pacote
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Cancun 7 dias All Inclusive - Riu Palace"
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Destino
              </label>
              <input
                type="text"
                required
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Cancun, México"
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {TIPOS.map((t) => (
                  <option key={t.v} value={t.v}>
                    {t.l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Duração (dias)
              </label>
              <input
                type="number"
                required
                min="1"
                value={duracaoDias}
                onChange={(e) => setDuracaoDias(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Valor total
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={valorTotal}
                onChange={(e) => setValorTotal(e.target.value)}
                placeholder="8500"
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Moeda
              </label>
              <select
                value={moeda}
                onChange={(e) => setMoeda(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="BRL">BRL</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Persona alvo
            </label>
            <input
              type="text"
              required
              value={personaAlvo}
              onChange={(e) => setPersonaAlvo(e.target.value)}
              placeholder="Casal sem filhos, 30-45 anos, primeira viagem internacional"
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Descrição do pacote *
            </label>
            <textarea
              required
              rows={5}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Hotel, refeições, traslados, passeios incluídos, atividades, etc."
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Diferenciais (opcional, mas recomendado)
            </label>
            <textarea
              rows={3}
              value={diferenciais}
              onChange={(e) => setDiferenciais(e.target.value)}
              placeholder="O que torna esse pacote especial? Ex: jantar privado na lagoa, traslado VIP, upgrade de quarto, guia local exclusivo..."
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Objeções comuns (opcional)
            </label>
            <textarea
              rows={3}
              value={objecoesComuns}
              onChange={(e) => setObjecoesComuns(e.target.value)}
              placeholder="Que dúvidas/objeções clientes costumam trazer? Ex: 'tá caro', 'medo de não ter o que fazer', 'preocupado com idioma'..."
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {erro && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
            {erro}
          </p>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold"
          >
            {salvando ? "Salvando..." : "Salvar pacote"}
          </button>
        </div>
      </form>
    </div>
  );
}
