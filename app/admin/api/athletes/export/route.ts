import { type NextRequest, NextResponse } from "next/server";
import { fetchAuthed } from "@/lib/admin/api";

export async function GET(request: NextRequest) {
  const qs = request.nextUrl.searchParams.toString();
  const path = `/admin/athletes/export${qs ? `?${qs}` : ""}`;

  let res: Response;
  try {
    res = await fetchAuthed(path, { cache: "no-store" });
  } catch (err) {
    console.error("[athletes/export] network error", { err });
    return NextResponse.json(
      { error: "network", message: "Falha de conexão com a API." },
      { status: 502 }
    );
  }

  if (res.status === 401 || res.status === 403) {
    return NextResponse.json({ error: "auth" }, { status: res.status });
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[athletes/export] backend not ok", {
      status: res.status,
      body: body.slice(0, 300),
    });
    return NextResponse.json(
      { error: "backend", message: `Falha ao exportar (HTTP ${res.status}).` },
      { status: res.status }
    );
  }

  const blob = await res.arrayBuffer();
  const contentType =
    res.headers.get("Content-Type") ??
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const disposition =
    res.headers.get("Content-Disposition") ??
    `attachment; filename="atletas-${new Date().toISOString().slice(0, 10)}.xlsx"`;

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": disposition,
      "Cache-Control": "no-store",
    },
  });
}
