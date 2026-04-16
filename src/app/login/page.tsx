"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-1">Entur OS</h1>
          <p className="text-sm text-slate-400">Sessão Estratégica — Vendas</p>
        </div>

        <form
          onSubmit={submit}
          className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4"
        >
          <div>
            <label className="text-xs text-slate-400 block mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="voce@empresa.com"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {erro && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded px-3 py-2">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-medium"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-[11px] text-slate-600 text-center mt-6">
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
