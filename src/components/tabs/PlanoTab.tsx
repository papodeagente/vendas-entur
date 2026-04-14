"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ACOES_PLANO } from "@/lib/acoes";
import { dinheiroNaMesa, DadosAgenciaInput } from "@/lib/calculo";
import { Alavanca } from "@/lib/perguntas";

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const ALAVANCA_CORES: Record<Alavanca, string> = {
  recuperacao: "bg-blue-600",
  recorrencia: "bg-purple-600",
  indicacao: "bg-amber-600",
};

const ALAVANCA_LABELS: Record<Alavanca, string> = {
  recuperacao: "Recuperação",
  recorrencia: "Recorrência",
  indicacao: "Indicação",
};

interface Props {
  respostas: Record<number, boolean>;
  dados: DadosAgenciaInput | null;
}

export function PlanoTab({ respostas, dados }: Props) {
  if (!dados) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-12 text-center">
          <p className="text-slate-400">
            Preencha as abas anteriores primeiro.
          </p>
        </CardContent>
      </Card>
    );
  }

  const resultado = dinheiroNaMesa(respostas, dados);

  // Calculate value per action based on leverage
  const valorPorAlavanca: Record<Alavanca, number> = {
    recuperacao: resultado.recuperacao,
    recorrencia: resultado.recorrencia,
    indicacao: resultado.indicacao,
  };

  const acoesPorAlavanca: Record<Alavanca, number> = { recuperacao: 0, recorrencia: 0, indicacao: 0 };
  ACOES_PLANO.forEach((a) => acoesPorAlavanca[a.alavanca]++);

  // Sort by value unlocked (higher first)
  const acoesSorted = [...ACOES_PLANO].sort((a, b) => {
    const valA = valorPorAlavanca[a.alavanca] / (acoesPorAlavanca[a.alavanca] || 1);
    const valB = valorPorAlavanca[b.alavanca] / (acoesPorAlavanca[b.alavanca] || 1);
    return valB - valA;
  });

  return (
    <div>
      <Card className="mb-6 bg-slate-800/50 border-slate-700">
        <CardContent className="py-4">
          <h3 className="text-white font-semibold mb-1">
            Roadmap de 90 dias
          </h3>
          <p className="text-slate-400 text-sm">
            Ações priorizadas por maior retorno financeiro. Cada ação mostra
            quanto dinheiro na mesa ela desbloqueia e qual módulo do Entur OS
            executa.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {acoesSorted.map((acao, index) => {
          const valorDesbloqueado =
            valorPorAlavanca[acao.alavanca] /
            (acoesPorAlavanca[acao.alavanca] || 1);

          return (
            <Card
              key={acao.id}
              className="bg-slate-800/50 border-slate-700"
            >
              <CardContent className="py-5">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium mb-2">{acao.acao}</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-slate-500 text-xs">Alavanca</p>
                        <Badge className={`${ALAVANCA_CORES[acao.alavanca]} text-white text-xs mt-1`}>
                          {ALAVANCA_LABELS[acao.alavanca]}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Dinheiro desbloqueado</p>
                        <p className="text-emerald-400 font-bold">
                          {formatBRL(valorDesbloqueado)}/mês
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Prazo</p>
                        <p className="text-slate-300">{acao.prazoSugerido}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">
                        Só é viável porque:
                      </p>
                      <p className="text-slate-300 text-sm">
                        {acao.soViavelPorque}
                      </p>
                      <p className="text-emerald-400/80 text-xs mt-2">
                        Módulo: {acao.moduloEnturOS}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
