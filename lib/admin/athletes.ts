import "server-only";
import { cache } from "react";
import { API_URL, fetchAuthed } from "./api";
import type {
  AdminAchievementsResponse,
  AdminAthleteDetail,
  AdminMatchListResponse,
  AdminPlaysResponse,
  AdminTeamHistoryResponse,
} from "./types";

export type DetailResult =
  | { kind: "ok"; data: AdminAthleteDetail }
  | { kind: "auth-error"; status: 401 | 403 }
  | { kind: "not-found" }
  | { kind: "http-error"; status: number; url: string }
  | { kind: "network-error"; url: string };

/**
 * Cacheado via React.cache — layout + page do mesmo request reaproveitam a
 * resposta sem bater na API duas vezes.
 */
export const getAdminAthleteDetail = cache(
  async (id: string): Promise<DetailResult> => {
    const path = `/admin/athletes/${id}`;
    const url = `${API_URL}${path}`;
    let res: Response;
    try {
      res = await fetchAuthed(path, { cache: "no-store" });
    } catch (err) {
      console.error("[athlete-detail] network error", { url, err });
      return { kind: "network-error", url };
    }
    if (res.status === 401 || res.status === 403) {
      return { kind: "auth-error", status: res.status as 401 | 403 };
    }
    if (res.status === 404) return { kind: "not-found" };
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[athlete-detail] not ok", {
        status: res.status,
        url,
        body: body.slice(0, 300),
      });
      return { kind: "http-error", status: res.status, url };
    }
    return { kind: "ok", data: (await res.json()) as AdminAthleteDetail };
  }
);

export type MatchesResult =
  | { kind: "ok"; data: AdminMatchListResponse }
  | { kind: "auth-error"; status: 401 | 403 }
  | { kind: "not-found" }
  | { kind: "http-error"; status: number; url: string }
  | { kind: "network-error"; url: string };

export async function getAdminAthleteMatches(
  athleteId: string,
  query: string
): Promise<MatchesResult> {
  return fetchList<AdminMatchListResponse>(
    `/admin/athletes/${athleteId}/matches`,
    query,
    "athlete-matches"
  );
}

export type PlaysResult =
  | { kind: "ok"; data: AdminPlaysResponse }
  | { kind: "auth-error"; status: 401 | 403 }
  | { kind: "not-found" }
  | { kind: "http-error"; status: number; url: string }
  | { kind: "network-error"; url: string };

export async function getAdminAthletePlays(
  athleteId: string,
  query: string
): Promise<PlaysResult> {
  return fetchList<AdminPlaysResponse>(
    `/admin/athletes/${athleteId}/plays`,
    query,
    "athlete-plays"
  );
}

export type AchievementsResult =
  | { kind: "ok"; data: AdminAchievementsResponse }
  | { kind: "auth-error"; status: 401 | 403 }
  | { kind: "not-found" }
  | { kind: "http-error"; status: number; url: string }
  | { kind: "network-error"; url: string };

export async function getAdminAthleteAchievements(
  athleteId: string,
  query: string
): Promise<AchievementsResult> {
  return fetchList<AdminAchievementsResponse>(
    `/admin/athletes/${athleteId}/achievements`,
    query,
    "athlete-achievements"
  );
}

export type TeamHistoryResult =
  | { kind: "ok"; data: AdminTeamHistoryResponse }
  | { kind: "auth-error"; status: 401 | 403 }
  | { kind: "not-found" }
  | { kind: "http-error"; status: number; url: string }
  | { kind: "network-error"; url: string };

export async function getAdminAthleteTeamHistory(
  athleteId: string
): Promise<TeamHistoryResult> {
  return fetchList<AdminTeamHistoryResponse>(
    `/admin/athletes/${athleteId}/team-history`,
    "",
    "athlete-team-history"
  );
}

type ListResult<T> =
  | { kind: "ok"; data: T }
  | { kind: "auth-error"; status: 401 | 403 }
  | { kind: "not-found" }
  | { kind: "http-error"; status: number; url: string }
  | { kind: "network-error"; url: string };

async function fetchList<T>(
  basePath: string,
  query: string,
  tag: string
): Promise<ListResult<T>> {
  const path = `${basePath}${query ? `?${query}` : ""}`;
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
