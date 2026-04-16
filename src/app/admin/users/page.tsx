"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";

interface User {
  id: number;
  email: string;
  nome: string;
  role: "admin" | "user";
  ativo: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function carregar() {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
  }

  useEffect(() => {
    carregar();
  }, []);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, nome, password, role }),
    });
    setCarregando(false);
    if (!res.ok) {
      const data = await res.json();
      setErro(data.error || "Erro");
      return;
    }
    setEmail("");
    setNome("");
    setPassword("");
    setRole("user");
    carregar();
  }

  async function toggleAtivo(u: User) {
    await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !u.ativo }),
    });
    carregar();
  }

  async function excluir(u: User) {
    if (!confirm(`Excluir ${u.email}?`)) return;
    await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    carregar();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-1">Gestão de Usuários</h1>
        <p className="text-sm text-slate-400 mb-8">
          Somente administradores podem adicionar, ativar/desativar ou excluir
          usuários.
        </p>

        <form
          onSubmit={criar}
          className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 mb-8"
        >
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
            Novo usuário
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Nome"
              className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="E-mail"
              className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Senha (min 8)"
              className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "user" | "admin")}
              className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="user">Usuário</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={carregando}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-medium"
            >
              {carregando ? "..." : "Adicionar"}
            </button>
          </div>
          {erro && (
            <p className="mt-3 text-sm text-red-400">{erro}</p>
          )}
        </form>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Nome</th>
                <th className="text-left px-4 py-3">E-mail</th>
                <th className="text-left px-4 py-3">Papel</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-800/60">
                  <td className="px-4 py-3 text-slate-200">{u.nome}</td>
                  <td className="px-4 py-3 text-slate-300">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        u.role === "admin"
                          ? "text-xs px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300"
                          : "text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300"
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAtivo(u)}
                      className={
                        u.ativo
                          ? "text-xs px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/60"
                          : "text-xs px-2 py-0.5 rounded bg-red-900/40 text-red-300 hover:bg-red-900/60"
                      }
                    >
                      {u.ativo ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => excluir(u)}
                      className="text-xs text-slate-500 hover:text-red-400"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
