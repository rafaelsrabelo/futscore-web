import "server-only";
import { cookies, headers } from "next/headers";
import { ADMIN_ACCESS_COOKIE, FRESH_TOKEN_HEADER } from "./constants";

/**
 * Normaliza o valor cru da env: remove trailing slash e espaços.
 * Não força `/api` porque endpoints podem variar entre ambientes.
 */
function normalizeApiUrl(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  const withoutTrailing = value.replace(/\/+$/, "");
  return withoutTrailing || "https://futscout-api.onrender.com/api";
}

export const API_URL = normalizeApiUrl(process.env.API_URL);

/**
 * Fetch contra o backend sem anexar credenciais.
 * Use para endpoints públicos (ex.: GET /public/athletes).
 */
export async function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, init);
}

/**
 * Fetch autenticado: anexa Authorization: Bearer <accessToken>.
 * Se o middleware rotacionou o token neste mesmo request, lê o novo
 * valor do header `x-admin-access-token`; senão cai no cookie.
 * Refresh-on-401 vive no middleware (`proxy.ts`) — não repetimos aqui.
 */
export async function fetchAuthed(path: string, init: RequestInit = {}) {
  const h = await headers();
  const fresh = h.get(FRESH_TOKEN_HEADER);
  const store = await cookies();
  const token = fresh ?? store.get(ADMIN_ACCESS_COOKIE)?.value;

  const reqHeaders = new Headers(init.headers);
  if (token) reqHeaders.set("Authorization", `Bearer ${token}`);
  if (init.body && !reqHeaders.has("Content-Type")) {
    reqHeaders.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${path}`, { ...init, headers: reqHeaders });
}
