import "server-only";
import { cache } from "react";
import { API_URL, fetchAuthed } from "./api";
import type { AdminUserDetail, AdminUsersResponse } from "./types";

export type UsersListResult =
  | { kind: "ok"; data: AdminUsersResponse }
  | { kind: "auth-error"; status: 401 | 403 }
  | { kind: "http-error"; status: number; url: string }
  | { kind: "network-error"; url: string };

export async function getAdminUsersList(query: string): Promise<UsersListResult> {
  const path = `/admin/users${query ? `?${query}` : ""}`;
  const url = `${API_URL}${path}`;
  let res: Response;
  try {
    res = await fetchAuthed(path, { cache: "no-store" });
  } catch (err) {
    console.error("[admin-users] network error", { url, err });
    return { kind: "network-error", url };
  }
  if (res.status === 401 || res.status === 403) {
    return { kind: "auth-error", status: res.status as 401 | 403 };
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[admin-users] not ok", {
      status: res.status,
      url,
      body: body.slice(0, 300),
    });
    return { kind: "http-error", status: res.status, url };
  }
  return { kind: "ok", data: (await res.json()) as AdminUsersResponse };
}

export type UserDetailResult =
  | { kind: "ok"; data: AdminUserDetail }
  | { kind: "auth-error"; status: 401 | 403 }
  | { kind: "not-found" }
  | { kind: "http-error"; status: number; url: string }
  | { kind: "network-error"; url: string };

/**
 * Cacheado via React.cache — layout + page do mesmo request reaproveitam a
 * resposta sem bater na API duas vezes.
 */
export const getAdminUserDetail = cache(
  async (id: string): Promise<UserDetailResult> => {
    const path = `/admin/users/${id}`;
    const url = `${API_URL}${path}`;
    let res: Response;
    try {
      res = await fetchAuthed(path, { cache: "no-store" });
    } catch (err) {
      console.error("[admin-user-detail] network error", { url, err });
      return { kind: "network-error", url };
    }
    if (res.status === 401 || res.status === 403) {
      return { kind: "auth-error", status: res.status as 401 | 403 };
    }
    if (res.status === 404) return { kind: "not-found" };
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[admin-user-detail] not ok", {
        status: res.status,
        url,
        body: body.slice(0, 300),
      });
      return { kind: "http-error", status: res.status, url };
    }
    return { kind: "ok", data: (await res.json()) as AdminUserDetail };
  }
);
