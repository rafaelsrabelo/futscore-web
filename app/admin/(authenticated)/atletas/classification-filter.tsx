"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function hrefFor(value: Value): string {
    const next = new URLSearchParams(searchParams.toString());
    if (value === "ALL") next.delete("classification");
    else next.set("classification", value);
    next.delete("page");
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function navigate(value: Value, event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    const url = hrefFor(value);
    startTransition(() => {
      router.replace(url, { scroll: false });
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1 rounded-lg border border-border/60 bg-card/40 p-1 w-fit",
        pending && "opacity-60",
      )}
    >
      {TABS.map(({ label, value }) => {
        const isActive = active === value;
        const href = hrefFor(value);
        return (
          <a
            key={value}
            href={href}
            onClick={(e) => navigate(value, e)}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap cursor-pointer",
              isActive
                ? "bg-primary text-primary-foreground font-medium shadow-sm shadow-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
            )}
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}
