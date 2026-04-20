import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  baseSearch: URLSearchParams;
  pathname: string;
}

function buildHref(pathname: string, base: URLSearchParams, targetPage: number) {
  const next = new URLSearchParams(base.toString());
  if (targetPage <= 1) next.delete("page");
  else next.set("page", String(targetPage));
  const qs = next.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function Pagination({
  page,
  pageSize,
  total,
  hasMore,
  baseSearch,
  pathname,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const prevDisabled = page <= 1;
  const nextDisabled = !hasMore;

  return (
    <nav className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
      <span className="text-xs text-muted-foreground">
        Página <span className="font-medium text-foreground">{page}</span> de{" "}
        <span className="font-medium text-foreground">{totalPages}</span> ·{" "}
        {total} atleta{total === 1 ? "" : "s"}
      </span>

      <div className="flex gap-2">
        <PageButton
          href={buildHref(pathname, baseSearch, page - 1)}
          disabled={prevDisabled}
          label="Anterior"
          icon="left"
        />
        <PageButton
          href={buildHref(pathname, baseSearch, page + 1)}
          disabled={nextDisabled}
          label="Próxima"
          icon="right"
        />
      </div>
    </nav>
  );
}

function PageButton({
  href,
  disabled,
  label,
  icon,
}: {
  href: string;
  disabled: boolean;
  label: string;
  icon: "left" | "right";
}) {
  const className = cn(
    "inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/40 px-3 py-1.5 text-sm transition-colors",
    disabled
      ? "opacity-40 pointer-events-none"
      : "hover:bg-accent/40 hover:border-primary/40"
  );

  const content = (
    <>
      {icon === "left" && <ChevronLeft className="w-4 h-4" />}
      {label}
      {icon === "right" && <ChevronRight className="w-4 h-4" />}
    </>
  );

  if (disabled) {
    return <span className={className}>{content}</span>;
  }
  return (
    <Link href={href} scroll={false} className={className}>
      {content}
    </Link>
  );
}
