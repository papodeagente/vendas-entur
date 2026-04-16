import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarSessao, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const sessao = await verificarSessao(token);
  if (!sessao) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  return NextResponse.json(sessao);
}
