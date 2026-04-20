import "server-only";
import { API_URL, fetchAuthed } from "./api";
import type {
  DashboardGrowthPeriod,
  DashboardInactivityBuckets,
  DashboardOverview,
  DashboardUserActivity,
  DashboardUserGrowth,
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

export type DashboardOverviewResult = Result<DashboardOverview>;
export type DashboardUserGrowthResult = Result<DashboardUserGrowth>;
export type DashboardUserActivityResult = Result<DashboardUserActivity>;
export type DashboardInactivityBucketsResult = Result<DashboardInactivityBuckets>;

export async function getDashboardOverview(
  periodDays: number
): Promise<DashboardOverviewResult> {
  const safe = Math.min(365, Math.max(1, periodDays));
  return fetchJson<DashboardOverview>(
    `/admin/dashboard/overview?periodDays=${safe}`,
    "dashboard-overview"
  );
}

export async function getDashboardUserGrowth(
  period: DashboardGrowthPeriod,
  from?: string,
  to?: string
): Promise<DashboardUserGrowthResult> {
  const params = new URLSearchParams({ period });
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return fetchJson<DashboardUserGrowth>(
    `/admin/dashboard/user-growth?${params}`,
    "dashboard-growth"
  );
}

export async function getDashboardUserActivity(): Promise<DashboardUserActivityResult> {
  return fetchJson<DashboardUserActivity>(
    `/admin/dashboard/user-activity`,
    "dashboard-activity"
  );
}

export async function getDashboardInactivityBuckets(): Promise<DashboardInactivityBucketsResult> {
  return fetchJson<DashboardInactivityBuckets>(
    `/admin/dashboard/inactivity-buckets`,
    "dashboard-inactivity"
  );
}
