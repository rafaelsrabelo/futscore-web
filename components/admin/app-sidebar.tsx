"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Database,
  Eye,
  KeyRound,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/atletas", label: "Atletas", icon: Users },
  { href: "/admin/partidas", label: "Partidas", icon: CalendarDays },
  { href: "/admin/olheiros", label: "Olheiros", icon: Eye },
  { href: "/admin/acessos", label: "Acessos", icon: KeyRound },
  { href: "/admin/notificacoes", label: "Notificações", icon: Bell },
  { href: "/admin/dados", label: "Dados", icon: Database },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

const STORAGE_KEY = "admin:sidebar-collapsed";

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "1") setCollapsed(true);
    } catch {}
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col shrink-0 sticky top-0 h-screen border-r border-border/60 bg-card/40 backdrop-blur-sm transition-[width] duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div
        className={cn(
          "flex items-center h-16 border-b border-border/60",
          collapsed ? "justify-center px-2" : "gap-2 px-5"
        )}
      >
        <Image
          src="/icon.png"
          alt="FutScore"
          width={32}
          height={32}
          className="object-contain shrink-0"
        />
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">FutScore</span>
            <span className="text-xs text-muted-foreground">Admin</span>
          </div>
        )}
      </div>

      <nav className={cn("flex-1 space-y-0.5", collapsed ? "p-2" : "p-3")}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              aria-label={collapsed ? label : undefined}
              className={cn(
                "flex items-center rounded-md text-sm transition-colors",
                collapsed
                  ? "justify-center h-10 w-full"
                  : "gap-3 px-3 py-2",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "border-t border-border/60",
          collapsed ? "p-2" : "p-3 flex items-center justify-between gap-2"
        )}
      >
        {!collapsed && (
          <span className="text-xs text-muted-foreground">
            v0.1 · © 2026 FutScore
          </span>
        )}
        <button
          type="button"
          onClick={toggle}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          className={cn(
            "flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors",
            collapsed ? "h-10 w-full" : "h-8 w-8"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
