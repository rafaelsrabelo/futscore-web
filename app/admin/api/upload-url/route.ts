import { NextResponse, type NextRequest } from "next/server";
import { fetchAuthed } from "@/lib/admin/api";

/**
 * Proxy pro GET /api/admin/videos/upload-url (BE-23).
 * Browser pega a presigned URL aqui, faz o PUT direto pro R2 com o vídeo.
 */
export async function GET(request: NextRequest) {
  const filename = request.nextUrl.searchParams.get("filename");
  if (!filename) {
    return NextResponse.json(
      { error: "missing_filename", message: "Parâmetro `filename` obrigatório." },
      { status: 400 }
    );
  }
  const qs = new URLSearchParams({ filename });
  const res = await fetchAuthed(`/admin/videos/upload-url?${qs}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[upload-url] backend not ok", { status: res.status, body: body.slice(0, 300) });
    return NextResponse.json(
      {
        error: "backend",
        status: res.status,
        message:
          res.status === 404
            ? "Endpoint de upload ainda não deployado (BE-23)."
            : `Falha ao gerar URL de upload (HTTP ${res.status}).`,
      },
      { status: res.status }
    );
  }
  return NextResponse.json(await res.json());
}
