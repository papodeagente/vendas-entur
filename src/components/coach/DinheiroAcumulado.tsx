"use client";

import { dinheiroNaMesa } from "@/lib/calculo";
import type { DadosAgenciaInput } from "@/lib/calculo";

interface Props {
  respostas: Record<number, boolean>;
  dados: DadosAgenciaInput;
}

function brl(n: number) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function DinheiroAcumulado({ respostas, dados }: Props) {
  const r = dinheiroNaMesa(respostas, dados);

  // Só acende alavancas com pelo menos 1 problema confirmado
  const problemasPor: Record<string, number> = { recuperacao: 0, recorrencia: 0, indicacao: 0 };
  // Mapeamento simplificado
  const mapa: Record<number, string[]> = {
    1: ["recuperacao"], 2: ["recuperacao"], 3: ["recuperacao"],
    4: ["recuperacao", "recorrencia", "indicacao"],
    5: ["recuperacao"], 6: ["recuperacao"], 7: ["recuperacao"],
    8: ["recorrencia"], 9: ["recorrencia"], 10: ["indicacao"],
  };
  Object.entries(respostas).forEach(([id, v]) => {
    if (v === false) {
      (mapa[Number(id)] || []).forEach((a) => {
        problemasPor[a] = (problemasPor[a] || 0) + 1;
      });
    }
  });

  const valRecuperacao = problemasPor.recuperacao > 0 ? r.recuperacao : 0;
  const valRecorrencia = problemasPor.recorrencia > 0 ? r.recorrencia : 0;
  const valIndicacao = problemasPor.indicacao > 0 ? r.indicacao : 0;
  const totalMes = valRecuperacao + valRecorrencia + valIndicacao;
  const totalAno = totalMes * 12;

  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-6">
        <div className="shrink-0">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Dinheiro na Mesa (acumulado)
          </p>
          <p className="text-xl font-bold text-emerald-400 tabular-nums">
            {brl(totalMes)}
            <span className="text-xs text-slate-500 ml-2">/ mês</span>
          </p>
          <p className="text-[11px] text-slate-400">
            {brl(totalAno)} em 12 meses
          </p>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-3">
          <Bloco label="Recuperação" valor={valRecuperacao} ativo={problemasPor.recuperacao > 0} />
          <Bloco label="Recorrência" valor={valRecorrencia} ativo={problemasPor.recorrencia > 0} />
          <Bloco label="Indicação" valor={valIndicacao} ativo={problemasPor.indicacao > 0} />
        </div>
      </div>
    </footer>
  );
}

function Bloco({ label, valor, ativo }: { label: string; valor: number; ativo: boolean }) {
  return (
    <div
      className={`px-3 py-2 rounded border transition-all ${
        ativo
          ? "bg-slate-900 border-amber-800/40"
          : "bg-slate-900/40 border-slate-800"
      }`}
    >
      <p className={`text-[10px] uppercase tracking-wider ${ativo ? "text-amber-400" : "text-slate-600"}`}>
        {label}
      </p>
      <p className={`text-sm font-semibold tabular-nums ${ativo ? "text-slate-100" : "text-slate-600"}`}>
        {ativo ? brl(valor) : "— aguardando problema"}
      </p>
    </div>
  );
}
