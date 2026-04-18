"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EnturLogo } from "@/components/EnturLogo";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.error || "Erro ao entrar");
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setErro("Erro de conexão");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0818] to-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center">
          <EnturLogo size="lg" showTagline />
          <div className="mt-6 flex items-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-purple-500/40" />
            <p className="text-xs text-slate-500 uppercase tracking-widest">
              Sessão Estratégica
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-purple-500/40" />
          </div>
        </div>

        <form
          onSubmit={submit}
          className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-7 space-y-5 shadow-2xl shadow-purple-900/10"
        >
          <div>
            <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
              placeholder="voce@empresa.com"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1.5">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
            />
          </div>

          {erro && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#FF1744] to-[#AA00FF] hover:from-[#FF4569] hover:to-[#C040FF] disabled:opacity-40 text-white font-semibold shadow-lg shadow-purple-900/30 transition-all"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-[11px] text-slate-600 text-center mt-8">
          Acesso restrito. Fale com o administrador para criar sua conta.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <LoginForm />
    </Suspense>
  );
}
