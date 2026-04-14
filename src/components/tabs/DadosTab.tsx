"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DadosAgencia {
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
}

const CAMPOS: {
  key: keyof DadosAgencia;
  label: string;
  placeholder: string;
  benchmark: string;
  sufixo?: string;
}[] = [
  { key: "vendasMes", label: "Vendas por mês", placeholder: "30", benchmark: "Agências similares: 20-50/mês" },
  { key: "ticketMedio", label: "Ticket médio (R$)", placeholder: "1600", benchmark: "Agências similares: R$ 1.200-2.500", sufixo: "R$" },
  { key: "comissaoPct", label: "Comissão (%)", placeholder: "10", benchmark: "Mercado: 8-15%", sufixo: "%" },
  { key: "atendPerdidos", label: "Atendimentos perdidos/mês", placeholder: "40", benchmark: "Média sem CRM: 60% dos leads" },
  { key: "clientesAtivos", label: "Clientes ativos", placeholder: "200", benchmark: "Base ativa média: 150-400" },
  { key: "clientesInativos", label: "Clientes inativos", placeholder: "500", benchmark: "Geralmente 2-3x a base ativa" },
  { key: "indicacoesMes", label: "Indicações por mês", placeholder: "3", benchmark: "Com programa ativo: 8-15/mês" },
  { key: "taxaConversao", label: "Taxa de conversão atual (%)", placeholder: "8", benchmark: "Com Entur OS: 14-22%", sufixo: "%" },
  { key: "tempoRecompra", label: "Tempo médio de recompra (meses)", placeholder: "8", benchmark: "Com processo ativo: 4-6 meses" },
  { key: "cpl", label: "Custo por lead - CPL (R$)", placeholder: "25", benchmark: "Turismo: R$ 15-50", sufixo: "R$" },
  { key: "ticket2aCompra", label: "Ticket médio 2ª compra (R$)", placeholder: "2200", benchmark: "Geralmente 30-50% maior que a 1ª", sufixo: "R$" },
  { key: "historicoMeses", label: "Meses de histórico comercial", placeholder: "12", benchmark: "Ideal: 12+ meses para projeção" },
];

const DEFAULTS: DadosAgencia = {
  vendasMes: 0,
  ticketMedio: 0,
  comissaoPct: 0,
  atendPerdidos: 0,
  clientesAtivos: 0,
  clientesInativos: 0,
  indicacoesMes: 0,
  taxaConversao: 0,
  tempoRecompra: 0,
  cpl: 0,
  ticket2aCompra: 0,
  historicoMeses: 12,
};

interface Props {
  sessaoId: number;
  dados: DadosAgencia | null;
  onSaved: () => void;
  onNext: () => void;
}

export function DadosTab({ sessaoId, dados, onSaved, onNext }: Props) {
  const [form, setForm] = useState<DadosAgencia>(dados || DEFAULTS);
  const [salvando, setSalvando] = useState(false);

  function handleChange(key: keyof DadosAgencia, value: string) {
    setForm((prev) => ({ ...prev, [key]: Number(value) || 0 }));
  }

  async function salvar() {
    setSalvando(true);
    await fetch(`/api/sessoes/${sessaoId}/dados`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    onSaved();
    setSalvando(false);
  }

  async function salvarEAvancar() {
    await salvar();
    onNext();
  }

  const camposPreenchidos = CAMPOS.filter(
    (c) => form[c.key] > 0
  ).length;

  return (
    <div>
      <Card className="mb-6 bg-slate-800/50 border-slate-700">
        <CardContent className="py-4">
          <p className="text-slate-300">
            Preencha os dados da operação. Os benchmarks ao lado mostram valores
            de agências similares usando Entur OS.
          </p>
          <p className="text-slate-500 text-sm mt-1">
            {camposPreenchidos} de {CAMPOS.length} campos preenchidos
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CAMPOS.map((campo) => (
          <Card key={campo.key} className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-4">
              <Label className="text-slate-300 text-sm">{campo.label}</Label>
              <div className="mt-1 relative">
                <Input
                  type="number"
                  value={form[campo.key] || ""}
                  onChange={(e) => handleChange(campo.key, e.target.value)}
                  placeholder={campo.placeholder}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              {form[campo.key] > 0 && (
                <p className="text-emerald-400/70 text-xs mt-2">
                  {campo.benchmark}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

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
          disabled={salvando || camposPreenchidos < 9}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Salvar e avançar para Dinheiro na Mesa →
        </Button>
      </div>
    </div>
  );
}
