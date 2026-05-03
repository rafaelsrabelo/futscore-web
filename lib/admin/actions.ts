"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchAuthed } from "./api";
import {
  ACCESS_COOKIE_MAX_AGE,
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  REFRESH_COOKIE_MAX_AGE,
} from "./constants";
import {
  createAchievementSchema,
  createMatchSchema,
  createTeamHistorySchema,
  loginSchema,
  resetPasswordSchema,
  updateAchievementSchema,
  updateAthleteSchema,
  updateMatchResultSchema,
  updateMatchSchema,
  updatePlaySchema,
  updateTeamHistorySchema,
  type CreateAchievementInput,
  type CreateMatchInput,
  type CreateTeamHistoryInput,
  type UpdateAchievementInput,
  type UpdateAthleteInput,
  type UpdateMatchInput,
  type UpdateMatchResultInput,
  type UpdatePlayInput,
  type UpdateTeamHistoryInput,
} from "./schemas";
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
    | { id: string }
    | null;
  return { ok: true, playId: data?.id ?? "" };
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

export type RemovePlayVideoResult =
  | { ok: true }
  | { ok: false; error: string };

export async function removePlayVideoAction(input: {
  playId: string;
}): Promise<RemovePlayVideoResult> {
  if (!input.playId) {
    return { ok: false, error: "ID do lance é obrigatório." };
  }

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/plays/${input.playId}/video-url`, {
      method: "DELETE",
      cache: "no-store",
    });
  } catch (err) {
    console.error("[removePlayVideoAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("[removePlayVideoAction] not ok", {
      status: res.status,
      body: txt.slice(0, 300),
    });
    if (res.status === 404) {
      return { ok: false, error: "Lance não encontrado." };
    }
    return {
      ok: false,
      error: `Falha ao remover vídeo (HTTP ${res.status}).`,
    };
  }

  return { ok: true };
}

export type DeletePlayResult =
  | { ok: true }
  | { ok: false; error: string };

export async function deletePlayAction(input: {
  playId: string;
}): Promise<DeletePlayResult> {
  if (!input.playId) {
    return { ok: false, error: "ID do lance é obrigatório." };
  }

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/plays/${input.playId}`, {
      method: "DELETE",
      cache: "no-store",
    });
  } catch (err) {
    console.error("[deletePlayAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("[deletePlayAction] not ok", {
      status: res.status,
      body: txt.slice(0, 300),
    });
    if (res.status === 404) {
      return { ok: false, error: "Lance não encontrado." };
    }
    return {
      ok: false,
      error: `Falha ao apagar lance (HTTP ${res.status}).`,
    };
  }

  return { ok: true };
}

export type UpdateAthleteResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      field?: "nickname" | "email" | "cpf";
    };

export async function updateAthleteAction(
  athleteId: string,
  input: UpdateAthleteInput
): Promise<UpdateAthleteResult> {
  if (!athleteId) {
    return { ok: false, error: "ID do atleta é obrigatório." };
  }

  const parsed = updateAthleteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/athletes/${athleteId}`, {
      method: "PATCH",
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[updateAthleteAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (res.ok) {
    revalidatePath(`/admin/atletas/${athleteId}`, "layout");
    return { ok: true };
  }

  const txt = await res.text().catch(() => "");
  let parsedBody: { message?: string } | null = null;
  try {
    parsedBody = txt ? (JSON.parse(txt) as { message?: string }) : null;
  } catch {
    parsedBody = null;
  }
  const message = parsedBody?.message;

  console.error("[updateAthleteAction] not ok", {
    status: res.status,
    body: txt.slice(0, 300),
  });

  if (res.status === 401 || res.status === 403) {
    return { ok: false, error: "Sessão expirada. Faça login de novo." };
  }
  if (res.status === 404) {
    return { ok: false, error: "Atleta não encontrado." };
  }
  if (res.status === 409) {
    const lower = (message ?? "").toLowerCase();
    const field = lower.includes("nickname")
      ? "nickname"
      : lower.includes("email") || lower.includes("e-mail")
        ? "email"
        : lower.includes("cpf")
          ? "cpf"
          : undefined;
    return {
      ok: false,
      error: message ?? "Valor já está em uso por outro usuário.",
      field,
    };
  }
  if (res.status === 400) {
    return { ok: false, error: message ?? "Dados inválidos." };
  }
  return {
    ok: false,
    error: message ?? `Falha ao salvar (HTTP ${res.status}).`,
  };
}

export type UpdatePlayResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updatePlayAction(
  playId: string,
  input: UpdatePlayInput
): Promise<UpdatePlayResult> {
  if (!playId) {
    return { ok: false, error: "ID do lance é obrigatório." };
  }

  const parsed = updatePlaySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/plays/${playId}`, {
      method: "PATCH",
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[updatePlayAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (res.ok) return { ok: true };

  const txt = await res.text().catch(() => "");
  let parsedBody: { message?: string } | null = null;
  try {
    parsedBody = txt ? (JSON.parse(txt) as { message?: string }) : null;
  } catch {
    parsedBody = null;
  }
  const message = parsedBody?.message;

  console.error("[updatePlayAction] not ok", {
    status: res.status,
    body: txt.slice(0, 300),
  });

  if (res.status === 404) return { ok: false, error: "Lance não encontrado." };
  if (res.status === 400) {
    return { ok: false, error: message ?? "Dados inválidos." };
  }
  return {
    ok: false,
    error: message ?? `Falha ao salvar (HTTP ${res.status}).`,
  };
}

export interface CreateStandalonePlayInput {
  athleteId: string;
  playType: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  photoUrl?: string;
  rating?: number;
  observations?: string;
  classifications?: string[];
}

export async function createStandalonePlayAction(
  input: CreateStandalonePlayInput
): Promise<CreatePlayResult> {
  if (!input.athleteId || !input.playType) {
    return { ok: false, error: "Atleta e tipo de lance são obrigatórios." };
  }

  const body: Record<string, unknown> = { playType: input.playType };
  if (input.videoUrl) body.videoUrl = input.videoUrl;
  if (input.thumbnailUrl) body.thumbnailUrl = input.thumbnailUrl;
  if (input.photoUrl) body.photoUrl = input.photoUrl;
  if (input.rating) body.rating = input.rating;
  if (input.observations) body.observations = input.observations;
  if (input.classifications?.length)
    body.classifications = input.classifications;

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/athletes/${input.athleteId}/plays`, {
      method: "POST",
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[createStandalonePlayAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("[createStandalonePlayAction] not ok", {
      status: res.status,
      body: txt.slice(0, 300),
    });
    if (res.status === 404) {
      return { ok: false, error: "Atleta não encontrado." };
    }
    if (res.status === 400) {
      return { ok: false, error: "Dados do lance inválidos." };
    }
    return { ok: false, error: `Falha ao salvar (HTTP ${res.status}).` };
  }

  const data = (await res.json().catch(() => null)) as { id: string } | null;
  return { ok: true, playId: data?.id ?? "" };
}

// ---------- Match write actions ----------

type SimpleResult = { ok: true } | { ok: false; error: string };

export type CreateMatchResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createMatchAction(
  input: CreateMatchInput
): Promise<CreateMatchResult> {
  const parsed = createMatchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/matches`, {
      method: "POST",
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[createMatchAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (res.ok) {
    revalidatePath("/admin/partidas");
    revalidatePath(
      `/admin/atletas/${parsed.data.athleteProfileId}/partidas`
    );
    revalidatePath(
      `/admin/atletas/${parsed.data.athleteProfileId}`,
      "layout"
    );
    const data = (await res.json().catch(() => null)) as { id: string } | null;
    return { ok: true, id: data?.id ?? "" };
  }

  const message = await readErrorMessage(res);
  console.error("[createMatchAction] not ok", { status: res.status });
  if (res.status === 404) {
    return { ok: false, error: message ?? "Atleta ou time não encontrado." };
  }
  if (res.status === 400) {
    return { ok: false, error: message ?? "Dados inválidos." };
  }
  return {
    ok: false,
    error: message ?? `Falha ao criar partida (HTTP ${res.status}).`,
  };
}

async function readErrorMessage(res: Response): Promise<string | undefined> {
  const txt = await res.text().catch(() => "");
  try {
    return txt
      ? ((JSON.parse(txt) as { message?: string }).message ?? undefined)
      : undefined;
  } catch {
    return undefined;
  }
}

export async function updateMatchAction(
  matchId: string,
  input: UpdateMatchInput
): Promise<SimpleResult> {
  if (!matchId) return { ok: false, error: "ID da partida é obrigatório." };

  const parsed = updateMatchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/matches/${matchId}`, {
      method: "PATCH",
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[updateMatchAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (res.ok) {
    revalidatePath(`/admin/partidas/${matchId}`);
    revalidatePath("/admin/partidas");
    return { ok: true };
  }

  const message = await readErrorMessage(res);
  console.error("[updateMatchAction] not ok", { status: res.status });
  if (res.status === 404) {
    return { ok: false, error: message ?? "Partida não encontrada." };
  }
  if (res.status === 400) {
    return { ok: false, error: message ?? "Dados inválidos." };
  }
  return {
    ok: false,
    error: message ?? `Falha ao salvar (HTTP ${res.status}).`,
  };
}

export async function updateMatchResultAction(
  matchId: string,
  input: UpdateMatchResultInput
): Promise<SimpleResult> {
  if (!matchId) return { ok: false, error: "ID da partida é obrigatório." };

  const parsed = updateMatchResultSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/matches/${matchId}/result`, {
      method: "PATCH",
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[updateMatchResultAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (res.ok) {
    revalidatePath(`/admin/partidas/${matchId}`);
    revalidatePath("/admin/partidas");
    return { ok: true };
  }

  const message = await readErrorMessage(res);
  console.error("[updateMatchResultAction] not ok", { status: res.status });
  if (res.status === 404) {
    return { ok: false, error: message ?? "Partida não encontrada." };
  }
  return {
    ok: false,
    error: message ?? `Falha ao salvar (HTTP ${res.status}).`,
  };
}

export async function linkMatchAthleteAction(
  matchId: string,
  athleteProfileId: string
): Promise<SimpleResult> {
  if (!matchId || !athleteProfileId) {
    return {
      ok: false,
      error: "ID da partida e do atleta são obrigatórios.",
    };
  }

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/matches/${matchId}/link-athlete`, {
      method: "POST",
      body: JSON.stringify({ athleteProfileId }),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[linkMatchAthleteAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (res.ok) {
    revalidatePath(`/admin/partidas/${matchId}`);
    return { ok: true };
  }

  const message = await readErrorMessage(res);
  console.error("[linkMatchAthleteAction] not ok", { status: res.status });
  if (res.status === 404) {
    return { ok: false, error: message ?? "Partida ou atleta não encontrado." };
  }
  return {
    ok: false,
    error: message ?? `Falha ao reatribuir (HTTP ${res.status}).`,
  };
}

export async function deleteMatchAction(
  matchId: string
): Promise<SimpleResult> {
  if (!matchId) return { ok: false, error: "ID da partida é obrigatório." };

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/matches/${matchId}`, {
      method: "DELETE",
      cache: "no-store",
    });
  } catch (err) {
    console.error("[deleteMatchAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (res.ok) {
    revalidatePath("/admin/partidas");
    return { ok: true };
  }

  const message = await readErrorMessage(res);
  console.error("[deleteMatchAction] not ok", { status: res.status });
  if (res.status === 404) {
    return { ok: false, error: message ?? "Partida não encontrada." };
  }
  return {
    ok: false,
    error: message ?? `Falha ao excluir (HTTP ${res.status}).`,
  };
}

// ---------- Achievements ----------

export async function createAchievementAction(
  athleteId: string,
  input: CreateAchievementInput
): Promise<SimpleResult & { id?: string }> {
  if (!athleteId) return { ok: false, error: "ID do atleta é obrigatório." };

  const parsed = createAchievementSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/athletes/${athleteId}/achievements`, {
      method: "POST",
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[createAchievementAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (res.ok) {
    revalidatePath(`/admin/atletas/${athleteId}/conquistas`);
    revalidatePath(`/admin/atletas/${athleteId}`, "layout");
    const data = (await res.json().catch(() => null)) as { id: string } | null;
    return { ok: true, id: data?.id };
  }

  const message = await readErrorMessage(res);
  console.error("[createAchievementAction] not ok", { status: res.status });
  if (res.status === 404) {
    return { ok: false, error: message ?? "Atleta não encontrado." };
  }
  if (res.status === 400) {
    return { ok: false, error: message ?? "Dados inválidos." };
  }
  return {
    ok: false,
    error: message ?? `Falha ao salvar (HTTP ${res.status}).`,
  };
}

export async function updateAchievementAction(
  achievementId: string,
  athleteId: string,
  input: UpdateAchievementInput
): Promise<SimpleResult> {
  if (!achievementId) {
    return { ok: false, error: "ID da conquista é obrigatório." };
  }

  const parsed = updateAchievementSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/achievements/${achievementId}`, {
      method: "PATCH",
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[updateAchievementAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (res.ok) {
    if (athleteId) {
      revalidatePath(`/admin/atletas/${athleteId}/conquistas`);
    }
    return { ok: true };
  }

  const message = await readErrorMessage(res);
  console.error("[updateAchievementAction] not ok", { status: res.status });
  if (res.status === 404) {
    return { ok: false, error: message ?? "Conquista não encontrada." };
  }
  if (res.status === 400) {
    return { ok: false, error: message ?? "Dados inválidos." };
  }
  return {
    ok: false,
    error: message ?? `Falha ao salvar (HTTP ${res.status}).`,
  };
}

export async function deleteAchievementAction(
  achievementId: string,
  athleteId: string
): Promise<SimpleResult> {
  if (!achievementId) {
    return { ok: false, error: "ID da conquista é obrigatório." };
  }

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/achievements/${achievementId}`, {
      method: "DELETE",
      cache: "no-store",
    });
  } catch (err) {
    console.error("[deleteAchievementAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (res.ok) {
    if (athleteId) {
      revalidatePath(`/admin/atletas/${athleteId}/conquistas`);
      revalidatePath(`/admin/atletas/${athleteId}`, "layout");
    }
    return { ok: true };
  }

  const message = await readErrorMessage(res);
  console.error("[deleteAchievementAction] not ok", { status: res.status });
  if (res.status === 404) {
    return { ok: false, error: message ?? "Conquista não encontrada." };
  }
  return {
    ok: false,
    error: message ?? `Falha ao excluir (HTTP ${res.status}).`,
  };
}

// ---------- Team history ----------

export async function createTeamHistoryAction(
  athleteId: string,
  input: CreateTeamHistoryInput
): Promise<SimpleResult & { id?: string }> {
  if (!athleteId) return { ok: false, error: "ID do atleta é obrigatório." };

  const parsed = createTeamHistorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/athletes/${athleteId}/team-history`, {
      method: "POST",
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[createTeamHistoryAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (res.ok) {
    revalidatePath(`/admin/atletas/${athleteId}/times`);
    revalidatePath(`/admin/atletas/${athleteId}`, "layout");
    const data = (await res.json().catch(() => null)) as { id: string } | null;
    return { ok: true, id: data?.id };
  }

  const message = await readErrorMessage(res);
  console.error("[createTeamHistoryAction] not ok", { status: res.status });
  if (res.status === 404) {
    return { ok: false, error: message ?? "Atleta ou time não encontrado." };
  }
  if (res.status === 400) {
    return { ok: false, error: message ?? "Dados inválidos." };
  }
  return {
    ok: false,
    error: message ?? `Falha ao salvar (HTTP ${res.status}).`,
  };
}

export async function updateTeamHistoryAction(
  entryId: string,
  athleteId: string,
  input: UpdateTeamHistoryInput
): Promise<SimpleResult> {
  if (!entryId) {
    return { ok: false, error: "ID da entrada é obrigatório." };
  }

  const parsed = updateTeamHistorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/team-history/${entryId}`, {
      method: "PATCH",
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[updateTeamHistoryAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (res.ok) {
    if (athleteId) {
      revalidatePath(`/admin/atletas/${athleteId}/times`);
    }
    return { ok: true };
  }

  const message = await readErrorMessage(res);
  console.error("[updateTeamHistoryAction] not ok", { status: res.status });
  if (res.status === 404) {
    return {
      ok: false,
      error: message ?? "Entrada ou time não encontrado.",
    };
  }
  if (res.status === 400) {
    return { ok: false, error: message ?? "Dados inválidos." };
  }
  return {
    ok: false,
    error: message ?? `Falha ao salvar (HTTP ${res.status}).`,
  };
}

export async function deleteTeamHistoryAction(
  entryId: string,
  athleteId: string
): Promise<SimpleResult> {
  if (!entryId) {
    return { ok: false, error: "ID da entrada é obrigatório." };
  }

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/team-history/${entryId}`, {
      method: "DELETE",
      cache: "no-store",
    });
  } catch (err) {
    console.error("[deleteTeamHistoryAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (res.ok) {
    if (athleteId) {
      revalidatePath(`/admin/atletas/${athleteId}/times`);
      revalidatePath(`/admin/atletas/${athleteId}`, "layout");
    }
    return { ok: true };
  }

  const message = await readErrorMessage(res);
  console.error("[deleteTeamHistoryAction] not ok", { status: res.status });
  if (res.status === 404) {
    return { ok: false, error: message ?? "Entrada não encontrada." };
  }
  return {
    ok: false,
    error: message ?? `Falha ao excluir (HTTP ${res.status}).`,
  };
}

// ---------- Reset password ----------

export async function resetAthletePasswordAction(
  athleteId: string,
  password: string
): Promise<SimpleResult> {
  if (!athleteId) return { ok: false, error: "ID do atleta é obrigatório." };

  const parsed = resetPasswordSchema.safeParse({ password });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Senha inválida.",
    };
  }

  let res: Response;
  try {
    res = await fetchAuthed(`/admin/athletes/${athleteId}/reset-password`, {
      method: "POST",
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[resetAthletePasswordAction] network error", err);
    return { ok: false, error: "Falha de conexão com a API." };
  }

  if (res.ok) return { ok: true };

  const message = await readErrorMessage(res);
  console.error("[resetAthletePasswordAction] not ok", {
    status: res.status,
  });
  if (res.status === 404) {
    return { ok: false, error: message ?? "Atleta não encontrado." };
  }
  if (res.status === 400) {
    return { ok: false, error: message ?? "Senha inválida." };
  }
  return {
    ok: false,
    error: message ?? `Falha ao redefinir (HTTP ${res.status}).`,
  };
}
