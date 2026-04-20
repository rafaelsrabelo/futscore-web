"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCESS_COOKIE_MAX_AGE,
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  REFRESH_COOKIE_MAX_AGE,
} from "./constants";
import { loginSchema } from "./schemas";
import type { TokenPair } from "./types";

const API_URL =
  process.env.API_URL ?? "https://futscout-api.onrender.com/api";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prev: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  let loginRes: Response;
  try {
    loginRes = await fetch(`${API_URL}/auth/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[loginAction] network error", { API_URL, err });
    return { error: "Não foi possível conectar à API. Tente novamente." };
  }

  if (loginRes.status === 401) {
    return { error: "E-mail ou senha inválidos." };
  }
  if (!loginRes.ok) {
    const body = await loginRes.text().catch(() => "");
    console.error("[loginAction] POST /auth/sessions not ok", {
      status: loginRes.status,
      url: `${API_URL}/auth/sessions`,
      body: body.slice(0, 500),
    });
    if (loginRes.status >= 500) {
      return { error: "Serviço indisponível. Tente em instantes." };
    }
    return { error: `Não foi possível entrar (HTTP ${loginRes.status}).` };
  }

  const tokens = (await loginRes.json()) as TokenPair;

  if (!tokens.accessToken || !tokens.refreshToken) {
    console.error("[loginAction] unexpected token payload", tokens);
    return { error: "Resposta de login inválida." };
  }

  // Valida role antes de persistir o cookie.
  const verifyRes = await fetch(`${API_URL}/admin/auth/verify`, {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
    cache: "no-store",
  });

  if (verifyRes.status === 403) {
    return { error: "Este login não tem acesso ao painel admin." };
  }
  if (!verifyRes.ok) {
    const body = await verifyRes.text().catch(() => "");
    console.error("[loginAction] GET /admin/auth/verify not ok", {
      status: verifyRes.status,
      body: body.slice(0, 500),
    });
    return { error: "Falha ao validar sessão admin." };
  }

  const store = await cookies();
  const common = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
  store.set(ADMIN_ACCESS_COOKIE, tokens.accessToken, {
    ...common,
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });
  store.set(ADMIN_REFRESH_COOKIE, tokens.refreshToken, {
    ...common,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  const accessToken = store.get(ADMIN_ACCESS_COOKIE)?.value;

  if (accessToken) {
    try {
      await fetch(`${API_URL}/auth/sessions`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
    } catch {
      // best-effort — sempre limpamos o cookie local a seguir
    }
  }

  store.delete(ADMIN_ACCESS_COOKIE);
  store.delete(ADMIN_REFRESH_COOKIE);
  redirect("/admin/login");
}
