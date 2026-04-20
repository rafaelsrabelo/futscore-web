import "server-only";
import { cache } from "react";
import { API_URL, fetchAuthed } from "./api";
import type {
  AdminMatchDetail,
  AdminMatchPlaysResponse,
  AdminMatchesGlobalResponse,
} from "./types";

type Result<T> =
  | { kind: "ok"; data: T }
  | { kind: "auth-error"; status: 401 | 403 }
  | { kind: "not-found" }
  | { kind: "http-error"; status: number; url: string }
  | { kind: "network-error"; url: string };

async function fetchJson<T>(path: string, tag: string): Promise<Result<T>> {
  const url = `${API_URL}${path}`;
  let res: Response;
  try {
    res = await fetchAuthed(path, { cache: "no-store" });
  } catch (err) {
    console.error(`[${tag}] network error`, { url, err });
    return { kind: "network-error", url };
  }
  if (res.status === 401 || res.status === 403) {
    return { kind: "auth-error", status: res.status as 401 | 403 };
  }
  if (res.status === 404) return { kind: "not-found" };
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[${tag}] not ok`, {
      status: res.status,
      url,
      body: body.slice(0, 300),
    });
    return { kind: "http-error", status: res.status, url };
  }
  return { kind: "ok", data: (await res.json()) as T };
}

export type AdminMatchesGlobalResult = Result<AdminMatchesGlobalResponse>;
export type AdminMatchDetailResult = Result<AdminMatchDetail>;
export type AdminMatchPlaysResult = Result<AdminMatchPlaysResponse>;

export async function getAdminMatches(
  query: string
): Promise<AdminMatchesGlobalResult> {
  return fetchJson<AdminMatchesGlobalResponse>(
    `/admin/matches${query ? `?${query}` : ""}`,
    "matches-global"
  );
}

export const getAdminMatchDetail = cache(
  async (id: string): Promise<AdminMatchDetailResult> => {
    return fetchJson<AdminMatchDetail>(
      `/admin/matches/${id}`,
      "match-detail"
    );
  }
);

export async function getAdminMatchPlays(
  id: string
): Promise<AdminMatchPlaysResult> {
  return fetchJson<AdminMatchPlaysResponse>(
    `/admin/matches/${id}/plays`,
    "match-plays"
  );
}
