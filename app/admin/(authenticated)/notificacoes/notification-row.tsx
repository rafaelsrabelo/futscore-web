"use client";

import { useState } from "react";
import { Bell, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { describeAudience } from "@/lib/admin/notifications-format";
import type { NotificationLogItem } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `há ${diffHr}h`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `há ${diffDay}d`;
  return TIME_FORMATTER.format(date);
}

export function NotificationRow({ item }: { item: NotificationLogItem }) {
  const [open, setOpen] = useState(false);

  const audienceLabel = describeAudience(item.audiencePayload);
  const failures = item.failureCount + item.invalidTokensCnt;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid grid-cols-12 gap-3 items-center w-full text-left px-4 py-3 border-b border-border/60 last:border-b-0 hover:bg-accent/30 transition-colors"
      >
        <span
          className="col-span-2 text-xs text-muted-foreground tabular-nums"
          title={TIME_FORMATTER.format(new Date(item.createdAt))}
        >
          {formatRelative(item.createdAt)}
        </span>

        <div className="col-span-5 min-w-0">
          <p className="text-sm font-medium truncate">{item.title}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {item.body}
          </p>
        </div>

        <span className="col-span-3 text-xs text-muted-foreground truncate">
          {audienceLabel}
        </span>

        <span className="col-span-1 text-xs text-right tabular-nums">
          <span className="font-medium">{item.totalWithToken}</span>
          <span className="text-muted-foreground">
            {" "}
            / {item.totalRecipients}
          </span>
        </span>

        <span
          className={cn(
            "col-span-1 text-xs text-right tabular-nums",
            failures > 0 ? "text-amber-400" : "text-emerald-400",
          )}
        >
          {item.successCount}
          {failures > 0 && (
            <span className="text-muted-foreground"> · {failures} falha{failures === 1 ? "" : "s"}</span>
          )}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Detalhe do envio
            </DialogTitle>
            <DialogDescription>
              Enviada em {TIME_FORMATTER.format(new Date(item.createdAt))}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <BannerPreview title={item.title} body={item.body} />

            <Section label="Audiência">
              <p className="text-sm">{audienceLabel}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tipo: {item.audienceType}
              </p>
            </Section>

            <div className="grid grid-cols-3 gap-2">
              <Stat label="Atendem ao filtro" value={item.totalRecipients} />
              <Stat label="Com app instalado" value={item.totalWithToken} />
              <Stat label="Aceitas pelo Expo" value={item.successCount} />
              <Stat
                label="Falhas"
                value={item.failureCount}
                tone={item.failureCount > 0 ? "warn" : "ok"}
              />
              <Stat
                label="Tokens removidos"
                value={item.invalidTokensCnt}
                tone={item.invalidTokensCnt > 0 ? "warn" : "ok"}
              />
            </div>

            {item.data && Object.keys(item.data).length > 0 && (
              <Section label="Deep link (data)">
                <pre className="text-[11px] bg-card/60 border border-border/60 rounded p-2 overflow-x-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(item.data, null, 2)}
                </pre>
              </Section>
            )}

            <Section label="Filtro completo (audiencePayload)">
              <pre className="text-[11px] bg-card/60 border border-border/60 rounded p-2 overflow-x-auto whitespace-pre-wrap break-words">
                {JSON.stringify(item.audiencePayload, null, 2)}
              </pre>
            </Section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground font-medium mb-1.5">
        {label}
      </p>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "ok",
}: {
  label: string;
  value: number;
  tone?: "ok" | "warn";
}) {
  return (
    <div className="rounded-md border border-border/60 bg-card/40 px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-base font-semibold tabular-nums",
          tone === "warn" && value > 0 && "text-amber-400",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function BannerPreview({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/60 p-3">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-md bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <ExternalLink className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground leading-tight">
            FutScore · agora
          </p>
          <p className="text-sm font-semibold leading-tight mt-0.5 truncate">
            {title || "Título da notificação"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {body || "Mensagem que o usuário verá no banner."}
          </p>
        </div>
      </div>
    </div>
  );
}
