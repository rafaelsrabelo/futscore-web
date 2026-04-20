import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE_MAX_AGE,
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  REFRESH_COOKIE_MAX_AGE,
  SESSION_HEADER,
} from "@/lib/admin/constants";

const API_URL =
  process.env.API_URL ?? "https://futscout-api.onrender.com/api";

interface VerifyPayload {
  userId: string;
  email: string;
  role: "ADMIN";
}
interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

async function verify(token: string): Promise<VerifyPayload | null> {
  try {
    const res = await fetch(`${API_URL}/admin/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as VerifyPayload;
  } catch {
    return null;
  }
}

async function refresh(refreshToken: string): Promise<TokenPair | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as TokenPair;
  } catch {
    return null;
  }
}

function applyCookies(res: NextResponse, tokens: TokenPair) {
  const common = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
  res.cookies.set(ADMIN_ACCESS_COOKIE, tokens.accessToken, {
    ...common,
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });
  res.cookies.set(ADMIN_REFRESH_COOKIE, tokens.refreshToken, {
    ...common,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

function clearCookies(res: NextResponse) {
  res.cookies.delete(ADMIN_ACCESS_COOKIE);
  res.cookies.delete(ADMIN_REFRESH_COOKIE);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  const accessToken = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value ?? null;
  const refreshToken = request.cookies.get(ADMIN_REFRESH_COOKIE)?.value ?? null;

  let verified = accessToken ? await verify(accessToken) : null;
  let rotated: TokenPair | null = null;

  if (!verified && refreshToken) {
    rotated = await refresh(refreshToken);
    if (rotated) verified = await verify(rotated.accessToken);
  }

  // Logado tentando acessar /admin/login → manda pra dashboard
  if (isLoginPage && verified) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    const res = NextResponse.redirect(url);
    if (rotated) applyCookies(res, rotated);
    return res;
  }

  // Não autenticado fora do login → limpa cookies e redireciona
  if (!isLoginPage && !verified) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    const res = NextResponse.redirect(url);
    clearCookies(res);
    return res;
  }

  // Autenticado: propaga a sessão via header pro Server Component ler cheap
  const requestHeaders = new Headers(request.headers);
  if (verified) {
    requestHeaders.set(SESSION_HEADER, JSON.stringify(verified));
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  if (rotated) applyCookies(res, rotated);
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
