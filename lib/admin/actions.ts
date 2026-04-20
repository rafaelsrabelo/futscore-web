"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchAuthed } from "./api";
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

export interface CreatePlayInput {
  matchId: string;
  playType: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  photoUrl?: string;
  rating?: number;
  observations?: string;
  classifications?: string[];
}

export type CreatePlayResult =
  | { ok: true; playId: string }
  | { ok: false; error: string };

export async function createPlayAction(
  input: CreatePlayInput
): Promise<CreatePlayResult> {
  if (!input.matchId || !input.playType) {
    return { ok: false, error: "Partida e tipo de lance são obrigatórios." };
  }

  const body: Record<string, unknown> = { playType: input.playType };
  if (input.videoUrl) body.videoUrl = input.videoUrl;
  if (input.thumbnailUrl) body.thumbnailUrl = input.thumbnailUrl;
  if (input.photoUrl) body.photoUrl = input.photoUrl;
  if (input.rating) body.rating = input.rating;
  if (input.observations) body.observations = input.observations;
  if (input.classifications?.length) body.classifications = input.classifications;

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/matches/${input.matchId}/plays`, {
      method: "POST",
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[createPlayAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("[createPlayAction] not ok", {
      status: res.status,
      body: txt.slice(0, 300),
    });
    if (res.status === 404) {
      return { ok: false, error: "Partida não encontrada." };
    }
    if (res.status === 400) {
      return { ok: false, error: "Dados do lance inválidos." };
    }
    return { ok: false, error: `Falha ao salvar (HTTP ${res.status}).` };
  }

  const data = (await res.json().catch(() => null)) as
    | { play?: { id: string }; id?: string }
    | null;
  return { ok: true, playId: data?.play?.id ?? data?.id ?? "" };
}

export interface AttachPlayVideoInput {
  playId: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

export type AttachPlayVideoResult =
  | { ok: true }
  | { ok: false; error: string };

export async function attachPlayVideoAction(
  input: AttachPlayVideoInput
): Promise<AttachPlayVideoResult> {
  if (!input.playId || !input.videoUrl) {
    return { ok: false, error: "ID do lance e URL do vídeo são obrigatórios." };
  }

  const body: Record<string, unknown> = { videoUrl: input.videoUrl };
  if (input.thumbnailUrl) body.thumbnailUrl = input.thumbnailUrl;

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/plays/${input.playId}/video-url`, {
      method: "PUT",
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[attachPlayVideoAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("[attachPlayVideoAction] not ok", {
      status: res.status,
      body: txt.slice(0, 300),
    });
    if (res.status === 404) {
      return { ok: false, error: "Lance não encontrado." };
    }
    if (res.status === 400) {
      return { ok: false, error: "URL de vídeo inválida." };
    }
    return { ok: false, error: `Falha ao anexar vídeo (HTTP ${res.status}).` };
  }

  return { ok: true };
}
