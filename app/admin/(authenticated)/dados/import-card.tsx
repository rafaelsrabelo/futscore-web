"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileUp,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ImportError {
  row: number;
  nome: string;
  cpf: string;
  error: string;
}

interface ImportResult {
  created: number;
  updated: number;
  total: number;
  errors: ImportError[];
}

const CHUNK_SIZE = 500;

type ImportState =
  | { status: "idle" }
  | { status: "loading"; chunk: number; total: number }
  | { status: "error"; message: string }
  | { status: "done"; result: ImportResult };

function splitCsvChunks(text: string): string[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  const [header, ...rows] = lines;
  const chunks: string[] = [];
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const slice = rows.slice(i, i + CHUNK_SIZE);
    chunks.push(header + "\n" + slice.join("\n"));
  }
  return chunks;
}

export function ImportCard() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState<ImportState>({ status: "idle" });

  function pickFile(f: File) {
    if (!f.name.endsWith(".csv")) {
      setState({ status: "error", message: "Apenas arquivos .csv são aceitos." });
      return;
    }
    setFile(f);
    if (state.status !== "idle") setState({ status: "idle" });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  }

  async function handleImport() {
    if (!file) return;

    let text: string;
    try {
      text = await file.text();
    } catch {
      setState({ status: "error", message: "Não foi possível ler o arquivo." });
      return;
    }

    const chunks = splitCsvChunks(text);
    if (chunks.length === 0) {
      setState({ status: "error", message: "O arquivo CSV está vazio." });
      return;
    }

    const accumulated: ImportResult = { created: 0, updated: 0, total: 0, errors: [] };

    for (let i = 0; i < chunks.length; i++) {
      setState({ status: "loading", chunk: i + 1, total: chunks.length });

      const blob = new Blob([chunks[i]], { type: "text/csv" });
      const form = new FormData();
      form.append("file", blob, file.name);

      let res: Response;
      try {
        res = await fetch("/admin/api/athletes/import", { method: "POST", body: form });
      } catch {
        setState({ status: "error", message: "Falha de conexão. Verifique a rede e tente novamente." });
        return;
      }

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setState({ status: "error", message: "Sessão expirada. Faça login novamente." });
        } else {
          const message =
            (json as { message?: string } | null)?.message ??
            `Erro HTTP ${res.status} no lote ${i + 1}.`;
          setState({ status: "error", message });
        }
        return;
      }

      const batch = json as ImportResult;
      accumulated.created += batch.created;
      accumulated.updated += batch.updated;
      accumulated.total += batch.total;
      // Offset row numbers so they reference the original file
      const rowOffset = i * CHUNK_SIZE;
      for (const err of batch.errors) {
        accumulated.errors.push({ ...err, row: err.row + rowOffset });
      }
    }

    setState({ status: "done", result: accumulated });
  }

  function reset() {
    setFile(null);
    setState({ status: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  }

  const loading = state.status === "loading";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <FileUp className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base">Importar Atletas via CSV</CardTitle>
            <CardDescription>
              Cadastre ou atualize múltiplos atletas de uma só vez
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors select-none",
            dragging
              ? "border-primary bg-primary/5"
              : "border-border/60 hover:border-primary/50 hover:bg-accent/30"
          )}
        >
          <Upload className="w-8 h-8 text-muted-foreground" />
          {file ? (
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="truncate max-w-[200px]">{file.name}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Remover arquivo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium">
                Arraste o arquivo ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground">Somente .csv</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pickFile(f);
            }}
          />
        </div>

        {/* Error message */}
        {state.status === "error" && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{state.message}</span>
          </div>
        )}

        {/* Result summary */}
        {state.status === "done" && (
          <ImportResultView result={state.result} onReset={reset} />
        )}

        {state.status !== "done" && (
          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={!file || loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileUp className="w-4 h-4" />
              )}
              {state.status === "loading"
                ? state.total > 1
                  ? `Processando lote ${state.chunk} de ${state.total}…`
                  : "Importando…"
                : "Importar"}
            </Button>
            {file && !loading && (
              <Button variant="outline" onClick={reset}>
                Cancelar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ImportResultView({
  result,
  onReset,
}: {
  result: ImportResult;
  onReset: () => void;
}) {
  const hasErrors = result.errors.length > 0;

  return (
    <div className="space-y-3">
      {/* Stats row */}
      <div className="flex flex-wrap gap-3">
        <StatPill
          label="Criados"
          value={result.created}
          color="text-emerald-500 bg-emerald-500/10"
        />
        <StatPill
          label="Atualizados"
          value={result.updated}
          color="text-sky-500 bg-sky-500/10"
        />
        <StatPill
          label="Total"
          value={result.total}
          color="text-muted-foreground bg-muted/50"
        />
        {hasErrors && (
          <StatPill
            label="Erros"
            value={result.errors.length}
            color="text-destructive bg-destructive/10"
          />
        )}
      </div>

      {/* Success banner when no errors */}
      {!hasErrors && (
        <div className="flex items-center gap-2 text-sm text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-md px-3 py-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Importação concluída sem erros.
        </div>
      )}

      {/* Error table */}
      {hasErrors && (
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <div className="bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border/60">
            Linhas com erro ({result.errors.length})
          </div>
          <ul className="divide-y divide-border/40 max-h-52 overflow-y-auto">
            {result.errors.map((e) => (
              <li key={`${e.row}-${e.cpf}`} className="px-3 py-2 text-xs">
                <span className="font-mono text-muted-foreground mr-2">
                  #{e.row}
                </span>
                <span className="font-medium mr-1">{e.nome}</span>
                <span className="text-muted-foreground mr-2">({e.cpf})</span>
                <span className="text-destructive">{e.error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button variant="outline" size="sm" onClick={onReset}>
        Nova importação
      </Button>
    </div>
  );
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        color
      )}
    >
      <span className="text-base font-bold leading-none">{value}</span>
      <span className="opacity-80">{label}</span>
    </div>
  );
}
