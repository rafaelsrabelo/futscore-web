import "server-only";
import { cookies } from "next/headers";
import { ADMIN_ACCESS_COOKIE } from "./constants";

export const API_URL =
  process.env.API_URL ?? "https://futscout-api.onrender.com/api";

/**
 * Fetch contra o backend sem anexar credenciais.
 * Use para endpoints públicos (ex.: GET /public/athletes).
 */
export async function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, init);
}

/**
 * Fetch autenticado: anexa Authorization: Bearer <accessToken> lendo o cookie httpOnly.
 * Refresh-on-401 vive no middleware (`proxy.ts`) — não repetimos aqui pra evitar loop.
 */
export async function fetchAuthed(path: string, init: RequestInit = {}) {
  const store = await cookies();
  const token = store.get(ADMIN_ACCESS_COOKIE)?.value;

  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${path}`, { ...init, headers });
}
