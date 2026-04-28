"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ExportState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string };

export function ExportCard() {
  const [state, setState] = useState<ExportState>({ status: "idle" });

  async function handleExport() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/admin/api/athletes/export");

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const message =
          (json as { message?: string } | null)?.message ??
          `Falha ao exportar (HTTP ${res.status}).`;
        setState({ status: "error", message });
        return;
      }

      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^";\n]+)"?/);
      const filename = match?.[1] ?? `atletas-${new Date().toISOString().slice(0, 10)}.xlsx`;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setState({ status: "idle" });
    } catch {
      setState({
        status: "error",
        message: "Falha de conexão. Verifique a rede e tente novamente.",
      });
    }
  }

  const loading = state.status === "loading";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base">Exportar Atletas</CardTitle>
            <CardDescription>
              Baixar planilha (.xlsx) com todos os atletas cadastrados
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="text-sm text-muted-foreground space-y-1">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
            Nome, CPF, data de nascimento
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
            Posição, gênero, pé dominante
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
            Altura, peso, clube atual
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
            Data de cadastro e último acesso
          </li>
        </ul>

        {state.status === "error" && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
            {state.message}
          </p>
        )}

        <Button
          onClick={handleExport}
          disabled={loading}
          className="w-full sm:w-auto gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {loading ? "Exportando…" : "Exportar planilha"}
        </Button>
      </CardContent>
    </Card>
  );
}
