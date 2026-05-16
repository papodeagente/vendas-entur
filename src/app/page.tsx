"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { EnturLogo } from "@/components/EnturLogo";
import {
  MODELO_AGENCIA_BUENOS_AIRES,
  MODELO_INTERNO_ENTUR,
  MODELOS_SPIN,
  metaModeloSpin,
} from "@/lib/modelosSpin";
import type { ModeloSpin } from "@/lib/modelosSpin";
import { LockKeyhole, Plane, ShieldCheck } from "lucide-react";

interface Sessao {
  id: number;
  modeloSpin: string;
  agenciaNome: string;
  vendedorNome: string;
  comercialStatus: string;
  ctaEscolhido: string | null;
  valorMesaMes: number | null;
  status: string;
  createdAt: string;
  usuario?: { id: number; nome: string; email: string } | null;
}

interface Me {
  userId: number;
  email: string;
  nome: string;
  role: "admin" | "user";
}

export default function HomePage() {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [agencia, setAgencia] = useState("");
  const [modeloSpin, setModeloSpin] = useState<ModeloSpin>(
    MODELO_AGENCIA_BUENOS_AIRES
  );
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/sessoes")
      .then((r) => r.json())
      .then(setSessoes);
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Me | null) => {
        setMe(data);
        setModeloSpin(
          data?.role === "admin"
            ? MODELO_INTERNO_ENTUR
            : MODELO_AGENCIA_BUENOS_AIRES
        );
      });
  }, []);

  async function criarSessao(e: React.FormEvent) {
    e.preventDefault();
    if (!agencia) return;
    setErro("");
    setCriando(true);
    const res = await fetch("/api/sessoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agenciaNome: agencia, modeloSpin }),
    });
    setCriando(false);
    if (!res.ok) {
      const data = await res.json();
      setErro(data.error || "Erro ao criar sessão");
      return;
    }
    const sessao = await res.json();
    router.push(`/sessao/${sessao.id}/ao-vivo`);
  }

  const modelosVisiveis = MODELOS_SPIN.filter(
    (modelo) => !modelo.restritoAdmin || me?.role === "admin"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12 flex flex-col items-center">
          <EnturLogo size="lg"  />
          <div className="mt-5 flex items-center gap-3">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-purple-500/30" />
            <p className="text-sm text-slate-400 tracking-wide">
              Sessão Estratégica — Dinheiro na Mesa
            </p>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-purple-500/30" />
          </div>
        </div>

        <Card className="mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Novo Atendimento SPIN Ao Vivo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={criarSessao} className="space-y-5">
              <div>
                <Label className="text-slate-300">Modelo de atendimento</Label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {modelosVisiveis.map((modelo) => {
                    const active = modeloSpin === modelo.key;
                    const Icon =
                      modelo.key === MODELO_INTERNO_ENTUR ? ShieldCheck : Plane;
                    return (
                      <button
                        type="button"
                        key={modelo.key}
                        onClick={() => setModeloSpin(modelo.key)}
                        className={`text-left rounded-xl border p-4 transition ${
                          active
                            ? "border-emerald-500 bg-emerald-950/30"
                            : "border-slate-700 bg-slate-900/50 hover:border-slate-500"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                active ? "bg-emerald-500/20" : "bg-slate-800"
                              }`}
                            >
                              <Icon className="h-4 w-4 text-emerald-300" />
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {modelo.label}
                              </p>
                              <p className="text-xs text-slate-400">
                                {modelo.subtitulo}
                              </p>
                            </div>
                          </div>
                          {modelo.restritoAdmin && (
                            <LockKeyhole className="h-4 w-4 text-slate-500" />
                          )}
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-slate-400">
                          {modelo.descricao}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label className="text-slate-300">Nome da Agência</Label>
                  <Input
                    value={agencia}
                    onChange={(e) => setAgencia(e.target.value)}
                    placeholder="Ex: Agência Viagens Top"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={criando || !agencia}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {criando ? "Criando..." : "Iniciar SPIN Ao Vivo"}
                </Button>
              </div>
              {erro && <p className="text-sm text-red-400">{erro}</p>}

              {modeloSpin === MODELO_AGENCIA_BUENOS_AIRES && (
                <div className="mt-2 p-3 rounded-lg bg-purple-900/20 border border-purple-700/40 text-xs text-slate-300">
                  <span className="text-purple-300 font-semibold">✨ Dica:</span>{" "}
                  Para um SPIN personalizado pelo pacote (destino, valor, persona), cadastre o pacote em{" "}
                  <a href="/pacotes" className="underline hover:text-purple-200">
                    /pacotes
                  </a>{" "}
                  e inicie o atendimento direto de lá. A IA gera as perguntas SPIN específicas para aquele pacote.
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {sessoes.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Sessões anteriores
            </h2>
            <div className="space-y-3">
              {sessoes.map((s) => {
                const modelo = metaModeloSpin(s.modeloSpin);
                return (
                <Card
                  key={s.id}
                  className="bg-slate-800/50 border-slate-700 hover:border-emerald-600/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/sessao/${s.id}/ao-vivo`)}
                >
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{s.agenciaNome}</p>
                        <Badge
                          variant="secondary"
                          className={
                            s.modeloSpin === MODELO_INTERNO_ENTUR
                              ? "bg-purple-900/50 text-purple-200"
                              : "bg-sky-900/50 text-sky-200"
                          }
                        >
                          {modelo.badge}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm">
                        Vendedor: {s.usuario?.nome || s.vendedorNome} •{" "}
                        {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                        {s.ctaEscolhido ? ` • CTA: ${s.ctaEscolhido}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {s.valorMesaMes ? (
                        <span className="text-sm text-emerald-300 font-semibold">
                          {s.valorMesaMes.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            maximumFractionDigits: 0,
                          })}
                          /mês
                        </span>
                      ) : null}
                      <Badge
                        variant={s.status === "completa" ? "default" : "secondary"}
                        className={
                          s.comercialStatus === "ganho"
                            ? "bg-emerald-600"
                            : s.comercialStatus === "perdido"
                            ? "bg-red-700"
                            : s.status === "completa"
                            ? "bg-purple-700"
                            : "bg-slate-600"
                        }
                      >
                        {s.comercialStatus || (s.status === "completa" ? "completa" : "rascunho")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
