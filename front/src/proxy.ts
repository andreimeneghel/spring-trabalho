import { NextResponse, type NextRequest } from "next/server";

const ROTAS_PUBLICAS = ["/login", "/registrar"];

/**
 * Checa apenas se o cookie de sessao existe — nao valida a assinatura do token,
 * o que exigiria uma chamada a API a cada navegacao. A validacao real acontece
 * quando a API responde 401 (ver lib/api/guard.ts).
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const temSessao = Boolean(request.cookies.get("soundhub_sessao")?.value);
  const ehPublica = ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota));

  if (!temSessao && !ehPublica) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (temSessao && ehPublica) {
    return NextResponse.redirect(new URL("/playlists", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
