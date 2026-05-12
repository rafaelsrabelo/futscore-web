import "server-only";
import { API_URL, fetchAuthed } from "./api";
import type {
  NotificationDetailResponse,
  NotificationsListResponse,
} from "./types";

export type NotificationsListResult =
  | { kind: "ok"; data: NotificationsListResponse }
  | { kind: "auth-error"; status: 401 | 403 }
  | { kind: "http-error"; status: number; url: string }
  | { kind: "network-error"; url: string };

export async function getAdminNotifications(
  query: string
): Promise<NotificationsListResult> {
  const path = `/admin/notifications${query ? `?${query}` : ""}`;
  const url = `${API_URL}${path}`;
  let res: Response;
  try {
    res = await fetchAuthed(path, { cache: "no-store" });
  } catch (err) {
    console.error("[admin-notifications] network error", { url, err });
    return { kind: "network-error", url };
  }
  if (res.status === 401 || res.status === 403) {
    return { kind: "auth-error", status: res.status as 401 | 403 };
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[admin-notifications] not ok", {
      status: res.status,
      url,
      body: body.slice(0, 300),
    });
    return { kind: "http-error", status: res.status, url };
  }
  return {
    kind: "ok",
    data: (await res.json()) as NotificationsListResponse,
  };
}

export type NotificationDetailResult =
  | { kind: "ok"; data: NotificationDetailResponse }
  | { kind: "auth-error"; status: 401 | 403 }
  | { kind: "not-found" }
  | { kind: "http-error"; status: number; url: string }
  | { kind: "network-error"; url: string };

export async function getAdminNotification(
  id: string
): Promise<NotificationDetailResult> {
  const path = `/admin/notifications/${id}`;
  const url = `${API_URL}${path}`;
  let res: Response;
  try {
    res = await fetchAuthed(path, { cache: "no-store" });
  } catch (err) {
    console.error("[admin-notification] network error", { url, err });
    return { kind: "network-error", url };
  }
  if (res.status === 401 || res.status === 403) {
    return { kind: "auth-error", status: res.status as 401 | 403 };
  }
  if (res.status === 404) return { kind: "not-found" };
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[admin-notification] not ok", {
      status: res.status,
      url,
      body: body.slice(0, 300),
    });
    return { kind: "http-error", status: res.status, url };
  }
  return {
    kind: "ok",
    data: (await res.json()) as NotificationDetailResponse,
  };
}
