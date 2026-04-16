"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";

interface Sessao {
  id: number;
  agenciaNome: string;
  vendedorNome: string;
  status: string;
  createdAt: string;
}

export default function HomePage() {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [agencia, setAgencia] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [criando, setCriando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/sessoes")
      .then((r) => r.json())
      .then(setSessoes);
  }, []);

  async function criarSessao(e: React.FormEvent) {
    e.preventDefault();
    if (!agencia || !vendedor) return;
    setCriando(true);
    const res = await fetch("/api/sessoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agenciaNome: agencia, vendedorNome: vendedor }),
    });
    const sessao = await res.json();
    router.push(`/sessao/${sessao.id}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Sessão Estratégica
          </h1>
          <p className="text-slate-400 text-lg">
            Simulador de Dinheiro na Mesa — Entur OS
          </p>
        </div>

        <Card className="mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Nova Sessão</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={criarSessao} className="flex gap-4 items-end">
              <div className="flex-1">
                <Label className="text-slate-300">Nome da Agência</Label>
                <Input
                  value={agencia}
                  onChange={(e) => setAgencia(e.target.value)}
                  placeholder="Ex: Agência Viagens Top"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="flex-1">
                <Label className="text-slate-300">Nome do Vendedor</Label>
                <Input
                  value={vendedor}
                  onChange={(e) => setVendedor(e.target.value)}
                  placeholder="Ex: Bruno"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Button
                type="submit"
                disabled={criando || !agencia || !vendedor}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {criando ? "Criando..." : "Iniciar Sessão"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {sessoes.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Sessões anteriores
            </h2>
            <div className="space-y-3">
              {sessoes.map((s) => (
                <Card
                  key={s.id}
                  className="bg-slate-800/50 border-slate-700 hover:border-emerald-600/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/sessao/${s.id}`)}
                >
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-white font-medium">{s.agenciaNome}</p>
                      <p className="text-slate-400 text-sm">
                        Vendedor: {s.vendedorNome} •{" "}
                        {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Badge
                      variant={s.status === "completa" ? "default" : "secondary"}
                      className={
                        s.status === "completa"
                          ? "bg-emerald-600"
                          : "bg-slate-600"
                      }
                    >
                      {s.status === "completa" ? "Completa" : "Rascunho"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
