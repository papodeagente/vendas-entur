"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dinheiroNaMesa, DadosAgenciaInput } from "@/lib/calculo";

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function comparador(valorAnual: number): string {
  if (valorAnual >= 500000) return "um apartamento";
  if (valorAnual >= 150000) return "um carro zero";
  if (valorAnual >= 50000) return "uma viagem para as Maldivas";
  if (valorAnual >= 20000) return "uma viagem internacional";
  return "várias viagens nacionais";
}

interface Props {
  respostas: Record<number, boolean>;
  dados: DadosAgenciaInput | null;
  onNext: () => void;
}

export function DinheiroTab({ respostas, dados, onNext }: Props) {
  if (!dados) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-12 text-center">
          <p className="text-slate-400">
            Preencha a aba Dados primeiro para ver o cálculo.
          </p>
        </CardContent>
      </Card>
    );
  }

  const resultado = dinheiroNaMesa(respostas, dados);

  const blocos = [
    {
      titulo: "Recuperação",
      subtitulo: "Vendas perdidas que voltam",
      cor: "blue",
      valor: resultado.recuperacao,
      valorHoje: resultado.recuperacaoHoje,
      descricao:
        "Atendimentos perdidos que seriam recuperados com processo ativo de follow-up no CRM.",
    },
    {
      titulo: "Recorrência",
      subtitulo: "Clientes ativos que voltam a comprar",
      cor: "purple",
      valor: resultado.recorrencia,
      valorHoje: resultado.recorrenciaHoje,
      descricao:
        "Recompra ativa + reativação de inativos com automação de pós-venda.",
    },
    {
      titulo: "Indicação",
      subtitulo: "Novos clientes por indicação ativa",
      cor: "amber",
      valor: resultado.indicacao,
      valorHoje: resultado.indicacaoHoje,
      descricao:
        "Programa de indicação estruturado com clientes satisfeitos.",
    },
  ];

  const corMap: Record<string, { bg: string; border: string; text: string; bar: string }> = {
    blue: { bg: "bg-blue-950/30", border: "border-blue-800/50", text: "text-blue-400", bar: "bg-blue-500" },
    purple: { bg: "bg-purple-950/30", border: "border-purple-800/50", text: "text-purple-400", bar: "bg-purple-500" },
    amber: { bg: "bg-amber-950/30", border: "border-amber-800/50", text: "text-amber-400", bar: "bg-amber-500" },
  };

  return (
    <div>
      {/* Counter */}
      <Card className="mb-6 bg-red-950/30 border-red-800/50">
        <CardContent className="py-4 text-center">
          <p className="text-red-300 text-sm">
            A cada dia sem processo, você abre mão de
          </p>
          <p className="text-red-400 text-3xl font-bold">
            {formatBRL(resultado.totalMes / 30)}
          </p>
        </CardContent>
      </Card>

      {/* 3 blocks */}
      <div className="space-y-4 mb-6">
        {blocos.map((bloco) => {
          const cores = corMap[bloco.cor];
          const maxVal = Math.max(bloco.valor, bloco.valorHoje, 1);
          const hojeWidth = (bloco.valorHoje / maxVal) * 100;
          const enturWidth = (bloco.valor / maxVal) * 100;

          return (
            <Card key={bloco.titulo} className={`${cores.bg} ${cores.border} border`}>
              <CardHeader className="pb-2">
                <CardTitle className={`${cores.text} text-lg`}>
                  {bloco.titulo}
                </CardTitle>
                <p className="text-slate-400 text-sm">{bloco.subtitulo}</p>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm mb-4">{bloco.descricao}</p>

                {/* Bars */}
                <div className="space-y-2 mb-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Hoje</span>
                      <span className="text-slate-400">{formatBRL(bloco.valorHoje)}/mês</span>
                    </div>
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-500 rounded-full"
                        style={{ width: `${hojeWidth}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={cores.text}>Com Entur OS</span>
                      <span className={`${cores.text} font-bold`}>
                        {formatBRL(bloco.valor)}/mês
                      </span>
                    </div>
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cores.bar} rounded-full`}
                        style={{ width: `${enturWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Totals */}
      <Card className="bg-emerald-950/30 border-emerald-700 mb-6">
        <CardContent className="py-8 text-center">
          <p className="text-emerald-300 text-sm mb-2">
            TOTAL DE DINHEIRO NA MESA
          </p>
          <p className="text-emerald-400 text-5xl font-bold mb-1">
            {formatBRL(resultado.totalMes)}
          </p>
          <p className="text-emerald-300/60 text-lg">por mês</p>
          <div className="flex justify-center gap-8 mt-4">
            <div>
              <p className="text-slate-400 text-xs">Por dia</p>
              <p className="text-white font-semibold">
                {formatBRL(resultado.totalMes / 30)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Por ano</p>
              <p className="text-white font-semibold">
                {formatBRL(resultado.totalAno)}
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-4">
            Ao longo de 3 anos, você está abrindo mão de{" "}
            <span className="text-white font-bold">
              {formatBRL(resultado.totalAno * 3)}
            </span>
          </p>
          <p className="text-emerald-300/50 text-sm mt-2">
            Isso equivale a {comparador(resultado.totalAno)} por ano.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Ver Plano de Ação →
        </Button>
      </div>
    </div>
  );
}
