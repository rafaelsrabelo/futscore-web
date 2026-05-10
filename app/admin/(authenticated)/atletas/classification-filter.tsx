"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CLASSIFICATION_FILTER_LABELS } from "@/lib/admin/classification";
import type { AthleteClassificationFilter } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type Value = AthleteClassificationFilter | "ALL";

const TABS: { label: string; value: Value }[] = [
  { label: CLASSIFICATION_FILTER_LABELS.ALL, value: "ALL" },
  {
    label: CLASSIFICATION_FILTER_LABELS.DESENVOLVIMENTO,
    value: "DESENVOLVIMENTO",
  },
  { label: CLASSIFICATION_FILTER_LABELS.PERFORMANCE, value: "PERFORMANCE" },
  { label: CLASSIFICATION_FILTER_LABELS.UNCLASSIFIED, value: "UNCLASSIFIED" },
];

export function ClassificationFilter({ active }: { active: Value }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(value: Value): string {
    const next = new URLSearchParams(searchParams.toString());
    if (value === "ALL") next.delete("classification");
    else next.set("classification", value);
    next.delete("page");
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-card/40 p-1 w-fit">
      {TABS.map(({ label, value }) => {
        const isActive = active === value;
        return (
          <Link
            key={value}
            href={hrefFor(value)}
            scroll={false}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap",
              isActive
                ? "bg-primary text-primary-foreground font-medium shadow-sm shadow-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
