import { type NextRequest, NextResponse } from "next/server";
import { fetchAuthed } from "@/lib/admin/api";

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "invalid_body", message: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json(
      { error: "missing_file", message: "Campo `file` obrigatório." },
      { status: 400 }
    );
  }

  // Re-build FormData to forward — DO NOT set Content-Type manually,
  // fetch will include the correct multipart boundary automatically.
  const forward = new FormData();
  forward.append("file", file, (file as File).name ?? "import.csv");

  let res: Response;
  try {
    res = await fetchAuthed("/admin/athletes/import", {
      method: "POST",
      body: forward,
    });
  } catch (err) {
    console.error("[athletes/import] network error", { err });
    return NextResponse.json(
      { error: "network", message: "Falha de conexão com a API." },
      { status: 502 }
    );
  }

  if (res.status === 401 || res.status === 403) {
    return NextResponse.json({ error: "auth" }, { status: res.status });
  }

  const body = await res.json().catch(() => null);

  return NextResponse.json(body, { status: res.ok ? 200 : res.status });
}
