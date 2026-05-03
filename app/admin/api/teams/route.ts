import { NextResponse, type NextRequest } from "next/server";
import { API_URL, fetchAuthed } from "@/lib/admin/api";

/**
 * Proxy local pro `GET /api/admin/teams`.
 * Usado pelo TeamPicker (client) sem expor o access token pro browser.
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const params = new URLSearchParams();
  const q = (sp.get("q") ?? "").trim();
  if (q) params.set("q", q);
  const athleteId = (sp.get("athleteId") ?? "").trim();
  if (athleteId) params.set("athleteId", athleteId);
  const page = sp.get("page");
  if (page) params.set("page", page);
  const pageSize = sp.get("pageSize");
  if (pageSize) params.set("pageSize", pageSize);

  const path = `/admin/teams${params.toString() ? `?${params}` : ""}`;

  let res: Response;
  try {
    res = await fetchAuthed(path, { cache: "no-store" });
  } catch (err) {
    console.error("[teams-proxy] network error", {
      url: `${API_URL}${path}`,
      err,
    });
    return NextResponse.json(
      { error: "network", message: "Falha de conexão com a API." },
      { status: 502 }
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[teams-proxy] backend not ok", {
      status: res.status,
      url: `${API_URL}${path}`,
      body: body.slice(0, 300),
    });
    let message = `Falha ao buscar times (HTTP ${res.status}).`;
    try {
      const parsed = body ? (JSON.parse(body) as { message?: string }) : null;
      if (parsed?.message) message = parsed.message;
    } catch {
      /* keep default */
    }
    return NextResponse.json(
      { error: "backend", status: res.status, message },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
