"use client";

import { Search, Shield, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface TeamPickerOption {
  id: string;
  name: string;
  acronym: string | null;
  shieldPhoto: string | null;
  isPrincipal: boolean;
}

interface TeamApiItem {
  id: string;
  name: string;
  acronym?: string | null;
  shieldPhoto?: string | null;
  isPrincipal?: boolean;
}

export function TeamPicker({
  selected,
  onChange,
  athleteId,
  placeholder = "Buscar time pelo nome",
  disabled,
}: {
  selected: TeamPickerOption | null;
  onChange: (team: TeamPickerOption | null) => void;
  /** Quando informado, restringe a busca aos times daquele atleta. */
  athleteId?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<TeamPickerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selected) {
      // Quando temos seleção, não buscamos automaticamente.
      return;
    }
    const trimmed = query.trim();
    setError(null);
    if (trimmed.length === 0 && !athleteId) {
      setItems([]);
      return;
    }
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    if (athleteId) params.set("athleteId", athleteId);
    params.set("pageSize", "20");

    let cancelled = false;
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/admin/api/teams?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}) as Record<string, unknown>);
        if (cancelled) return;
        if (!res.ok) {
          setItems([]);
          setError(
            (data as { message?: string }).message ??
              "Falha ao buscar times."
          );
          return;
        }
        const list = ((data as { items?: TeamApiItem[] }).items ?? []).map(
          (t) => ({
            id: t.id,
            name: t.name,
            acronym: t.acronym ?? null,
            shieldPhoto: t.shieldPhoto ?? null,
            isPrincipal: Boolean(t.isPrincipal),
          })
        );
        setItems(list);
      } catch {
        if (!cancelled) {
          setItems([]);
          setError("Falha de conexão.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, athleteId, selected]);

  if (selected) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-input bg-card/40 px-3 py-2">
        <TeamShield team={selected} className="w-7 h-7" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium truncate">
              {selected.name}
            </span>
            {selected.acronym && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                {selected.acronym}
              </span>
            )}
          </div>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
            aria-label="Limpar seleção"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  const showHint = query.trim().length === 0 && !athleteId;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
          disabled={disabled}
        />
      </div>
      {showHint ? (
        <p className="text-[11px] text-muted-foreground">
          Digite parte do nome do time pra buscar.
        </p>
      ) : loading ? (
        <p className="text-xs text-muted-foreground">Buscando...</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nenhum time encontrado.
        </p>
      ) : (
        <div className="border border-border/60 rounded-md max-h-60 overflow-y-auto">
          {items.map((team) => (
            <button
              key={team.id}
              type="button"
              onClick={() => onChange(team)}
              className={cn(
                "w-full flex items-center gap-3 p-2.5 text-left border-b border-border/40 last:border-b-0",
                "hover:bg-accent/40 focus-visible:bg-accent/60 focus-visible:outline-hidden"
              )}
            >
              <TeamShield team={team} className="w-7 h-7" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-medium truncate">
                    {team.name}
                  </span>
                  {team.acronym && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                      {team.acronym}
                    </span>
                  )}
                  {team.isPrincipal && (
                    <span className="text-[9px] uppercase tracking-wider bg-primary/15 text-primary rounded px-1.5 py-0.5">
                      Principal
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamShield({
  team,
  className,
}: {
  team: TeamPickerOption;
  className?: string;
}) {
  if (team.shieldPhoto) {
    return (
      <div
        className={cn(
          "relative rounded-md overflow-hidden bg-muted shrink-0",
          className
        )}
      >
        <Image
          src={team.shieldPhoto}
          alt={team.name}
          fill
          sizes="32px"
          className="object-contain"
        />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "rounded-md bg-muted shrink-0 flex items-center justify-center text-muted-foreground",
        className
      )}
    >
      <Shield className="w-3.5 h-3.5" />
    </div>
  );
}
