"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface AthleteTab {
  href: string;
  label: string;
  badge?: number;
  disabled?: boolean;
}

export function AthleteTabs({ tabs }: { tabs: AthleteTab[] }) {
  const pathname = usePathname();
  return (
    <div className="mt-6 border-b border-border/60">
      <nav className="flex gap-6 overflow-x-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return <TabItem key={tab.href} tab={tab} active={active} />;
        })}
      </nav>
    </div>
  );
}

function TabItem({ tab, active }: { tab: AthleteTab; active: boolean }) {
  const className = cn(
    "inline-flex items-center gap-2 px-1 py-2.5 text-sm border-b-2 -mb-px transition-colors whitespace-nowrap",
    active
      ? "border-primary text-foreground font-medium"
      : "border-transparent text-muted-foreground hover:text-foreground",
    tab.disabled && "opacity-50 pointer-events-none"
  );
  const content = (
    <>
      {tab.label}
      {tab.badge != null && tab.badge > 0 && (
        <span className="rounded-full bg-muted text-muted-foreground text-[10px] font-semibold px-1.5 py-0.5">
          {tab.badge}
        </span>
      )}
      {tab.disabled && (
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground bg-muted rounded px-1.5 py-0.5">
          em breve
        </span>
      )}
    </>
  );
  if (tab.disabled) return <span className={className}>{content}</span>;
  return (
    <Link href={tab.href} className={className}>
      {content}
    </Link>
  );
}
