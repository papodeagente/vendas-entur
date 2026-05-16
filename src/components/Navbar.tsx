"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EnturLogo } from "@/components/EnturLogo";

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
    <nav className="bg-slate-900/90 backdrop-blur-sm border-b border-slate-800/80 px-6 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <EnturLogo size="sm" />
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <Link
            href="/"
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            Sessões
          </Link>
          {me.role === "admin" && (
            <>
              <Link
                href="/admin/dashboard"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Usuários
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500">{me.nome}</span>
          <button
            onClick={sair}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-slate-800/60"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
