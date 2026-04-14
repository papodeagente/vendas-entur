"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PERGUNTAS, Alavanca } from "@/lib/perguntas";

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
  sessaoId: number;
  respostas: Record<number, boolean>;
  onSaved: () => void;
  onNext: () => void;
}

export function DiagnosticoTab({ sessaoId, respostas: initial, onSaved, onNext }: Props) {
  const [respostas, setRespostas] = useState<Record<number, boolean>>(initial);
  const [salvando, setSalvando] = useState(false);

  const totalRespondidas = Object.keys(respostas).length;
  const totalSim = Object.values(respostas).filter(Boolean).length;
  const score = PERGUNTAS.length > 0 ? Math.round((totalSim / PERGUNTAS.length) * 100) : 0;

  function toggle(perguntaId: number, valor: boolean) {
    setRespostas((prev) => ({ ...prev, [perguntaId]: valor }));
  }

  async function salvar() {
    setSalvando(true);
    const arr = Object.entries(respostas).map(([k, v]) => ({
      perguntaId: Number(k),
      resposta: v,
    }));
    await fetch(`/api/sessoes/${sessaoId}/diagnostico`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respostas: arr }),
    });
    onSaved();
    setSalvando(false);
  }

  async function salvarEAvancar() {
    await salvar();
    onNext();
  }

  return (
    <div>
      {/* Score card */}
      <Card className="mb-6 bg-slate-800/50 border-slate-700">
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Score de Maturidade</h3>
            <span className="text-3xl font-bold text-emerald-400">{score}%</span>
          </div>
          <Progress value={score} className="h-3" />
          <p className="text-slate-400 text-sm mt-2">
            {totalRespondidas} de {PERGUNTAS.length} perguntas respondidas •{" "}
            {totalSim} processos ativos
          </p>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {PERGUNTAS.map((p) => {
          const respondida = respostas[p.id] !== undefined;
          const isNao = respondida && respostas[p.id] === false;

          return (
            <Card
              key={p.id}
              className={`border transition-colors ${
                isNao
                  ? "bg-red-950/30 border-red-800/50"
                  : respondida && respostas[p.id]
                  ? "bg-emerald-950/20 border-emerald-800/50"
                  : "bg-slate-800/50 border-slate-700"
              }`}
            >
              <CardContent className="py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">
                      {p.id}. {p.texto}
                    </p>
                    <p className="text-slate-400 text-sm mb-3">
                      {p.porqueImporta}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {p.alavancas.map((a) => (
                        <Badge key={a} className={`${ALAVANCA_CORES[a]} text-white text-xs`}>
                          {ALAVANCA_LABELS[a]}
                        </Badge>
                      ))}
                    </div>
                    {isNao && (
                      <div className="mt-3 p-3 bg-red-900/20 rounded-lg border border-red-800/30">
                        <p className="text-red-300 text-sm font-medium">
                          Módulo Entur OS: {p.moduloEnturOS}
                        </p>
                        <p className="text-red-400/80 text-xs mt-1">
                          {p.fatorPerda}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => toggle(p.id, true)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        respostas[p.id] === true
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      onClick={() => toggle(p.id, false)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        respostas[p.id] === false
                          ? "bg-red-600 text-white"
                          : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                      }`}
                    >
                      Não
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-between mt-8">
        <Button
          onClick={salvar}
          disabled={salvando}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          {salvando ? "Salvando..." : "Salvar rascunho"}
        </Button>
        <Button
          onClick={salvarEAvancar}
          disabled={salvando || totalRespondidas < PERGUNTAS.length}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Salvar e avançar para Dados →
        </Button>
      </div>
    </div>
  );
}
