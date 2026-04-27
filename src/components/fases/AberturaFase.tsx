"use client";

import { useState } from "react";
import type { SessaoAoVivo } from "@/app/sessao/[id]/ao-vivo/page";

interface Props {
  sessao: SessaoAoVivo;
  onConcluir: () => void;
  onRefresh: () => void;
}

export function AberturaFase({ sessao, onConcluir, onRefresh }: Props) {
  const [nome, setNome] = useState(sessao.prospect?.nome || "");
  const [cargo, setCargo] = useState(sessao.prospect?.cargo || "");
  const [tamanhoEquipe, setTamanhoEquipe] = useState(
    sessao.prospect?.tamanhoEquipe?.toString() || ""
  );
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    await fetch(`/api/sessoes/${sessao.id}/prospect`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        cargo,
        tamanhoEquipe: tamanhoEquipe ? Number(tamanhoEquipe) : null,
      }),
    });
    setSalvando(false);
    onRefresh();
  }

  const podeAvancar = nome.trim().length >= 2;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Script de abertura — Antigravity contract */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-3">
          Leia em voz alta — contrato da reunião
        </p>
        <p className="text-slate-100 leading-relaxed italic">
          &ldquo;Obrigado por reservar esses 40 minutos. A ideia é simples: vou
          fazer algumas perguntas pra entender como funciona sua operação
          comercial hoje. Depois{" "}
          <span className="text-emerald-300 not-italic font-medium">
            vou te mostrar quanto dinheiro está passando pela sua mão todo mês —
            em venda perdida, recompra que não acontece e indicação que não
            chega — sem você capturar
          </span>
          . E no final{" "}
          <span className="text-emerald-300 not-italic font-medium">
            a gente decide juntos o próximo passo
          </span>
          . Posso começar?&rdquo;
        </p>
        <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-3 gap-3 text-[11px]">
          <div className="text-slate-400">
            <span className="block text-emerald-400 font-semibold">
              ✗ Não diga
            </span>
            &ldquo;se fizer sentido, eu te mostro&rdquo;
          </div>
          <div className="text-slate-400">
            <span className="block text-emerald-400 font-semibold">✗ Não pitche</span>
            Apenas peça permissão pra perguntar.
          </div>
          <div className="text-slate-400">
            <span className="block text-emerald-400 font-semibold">✓ Faça</span>
            Use o nome dele durante toda a sessão.
          </div>
        </div>
      </div>

      {/* Captura do prospect */}
      <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div>
          <h3 className="font-semibold mb-1">Com quem estamos falando?</h3>
          <p className="text-xs text-slate-500">
            Capture o nome e o cargo. Use durante a conversa — pessoas gostam
            de ser chamadas pelo nome.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do prospect"
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            placeholder="Cargo (ex: Diretor Comercial)"
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <input
            type="number"
            value={tamanhoEquipe}
            onChange={(e) => setTamanhoEquipe(e.target.value)}
            placeholder="Tamanho da equipe comercial"
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 col-span-2"
          />
        </div>
        <button
          onClick={salvar}
          disabled={salvando || !podeAvancar}
          className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-sm disabled:opacity-40"
        >
          {salvando ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onConcluir}
          disabled={!podeAvancar}
          className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
        >
          Começar Situação →
        </button>
      </div>
    </div>
  );
}
