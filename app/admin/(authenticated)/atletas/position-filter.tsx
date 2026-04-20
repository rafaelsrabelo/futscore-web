"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Position } from "@/lib/types";

type Value = Position | "ALL";

const TABS: { label: string; value: Value }[] = [
  { label: "Todas", value: "ALL" },
  { label: "Goleiros", value: "GOALKEEPER" },
  { label: "Defensores", value: "DEFENDER" },
  { label: "Meio-campo", value: "MIDFIELDER" },
  { label: "Atacantes", value: "FORWARD" },
];

export function PositionFilter({ active }: { active: Value }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-card/40 p-1 w-fit">
      {TABS.map(({ label, value }) => {
        const isActive = active === value;
        const href =
          value === "ALL" ? "/admin/atletas" : `/admin/atletas?position=${value}`;
        return (
          <Link
            key={value}
            href={href}
            scroll={false}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap",
              isActive
                ? "bg-primary text-primary-foreground font-medium shadow-sm shadow-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
