"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Me {
  userId: number;
  email: string;
  nome: string;
  role: "admin" | "user";
}

export function Navbar() {
  const [me, setMe] = useState<Me | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (!me) return null;

  return (
    <nav className="bg-slate-900/80 border-b border-slate-800 px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-white font-semibold text-sm">
            Entur OS
          </Link>
          <Link
            href="/"
            className="text-slate-400 hover:text-white text-sm"
          >
            Sessões
          </Link>
          {me.role === "admin" && (
            <Link
              href="/admin/users"
              className="text-slate-400 hover:text-white text-sm"
            >
              Usuários
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500">{me.nome}</span>
          <button
            onClick={sair}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
