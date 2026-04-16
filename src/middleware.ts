import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verificarSessao, SESSION_COOKIE } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicas = ["/login", "/api/auth/login", "/api/auth/logout"];
  if (publicas.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const sessao = await verificarSessao(token);

  if (!sessao) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (sessao.role !== "admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
