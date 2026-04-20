"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Eye,
  KeyRound,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/atletas", label: "Atletas", icon: Users },
  { href: "/admin/olheiros", label: "Olheiros", icon: Eye },
  { href: "/admin/acessos", label: "Acessos", icon: KeyRound },
  { href: "/admin/notificacoes", label: "Notificações", icon: Bell },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-border/60 bg-card/40 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-border/60">
        <Image
          src="/icon.png"
          alt="FutScore"
          width={32}
          height={32}
          className="object-contain"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">FutScore</span>
          <span className="text-xs text-muted-foreground">Admin</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/60 text-xs text-muted-foreground">
        v0.1 · © 2026 FutScore
      </div>
    </aside>
  );
}
