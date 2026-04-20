import { NextResponse, type NextRequest } from "next/server";
import { API_URL, fetchAuthed } from "@/lib/admin/api";

/**
 * Proxy local pro `GET /api/admin/search` (BE-21).
 * Evita expor o access token pro browser — `fetchAuthed` lê o cookie httpOnly
 * no server e anexa Authorization.
 */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  const limit = request.nextUrl.searchParams.get("limit") ?? "5";

  if (q.length < 2) {
    return NextResponse.json({ athletes: [], matches: [] });
  }

  const path = `/admin/search?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}`;

  let res: Response;
  try {
    res = await fetchAuthed(path, { cache: "no-store" });
  } catch (err) {
    console.error("[global-search] network error", { url: `${API_URL}${path}`, err });
    return NextResponse.json(
      { error: "network", message: "Falha de conexão com a API." },
      { status: 502 }
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[global-search] backend not ok", {
      status: res.status,
      url: `${API_URL}${path}`,
      body: body.slice(0, 300),
    });
    const hint =
      res.status === 404
        ? "Endpoint de busca ainda não deployado."
        : res.status >= 500
          ? "API temporariamente indisponível."
          : `Falha na busca (HTTP ${res.status}).`;
    return NextResponse.json(
      { error: "backend", status: res.status, message: hint },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
