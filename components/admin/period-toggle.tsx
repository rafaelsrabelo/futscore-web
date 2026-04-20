"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

export function PeriodToggle({
  paramName,
  activeValue,
  options,
  ariaLabel,
}: {
  paramName: string;
  activeValue: string;
  options: Option[];
  ariaLabel?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(value: string): string {
    const next = new URLSearchParams(searchParams.toString());
    next.set(paramName, value);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div
      aria-label={ariaLabel}
      className="inline-flex items-center rounded-md border border-border/60 bg-card/30 p-1"
    >
      {options.map((opt) => {
        const active = activeValue === opt.value;
        return (
          <Link
            key={opt.value}
            href={hrefFor(opt.value)}
            scroll={false}
            className={cn(
              "px-3 py-1 rounded text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </Link>
        );
      })}
    </div>
  );
}
