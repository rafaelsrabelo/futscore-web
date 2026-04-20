"use client";

import { ChevronDown, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/lib/admin/actions";
import type { AdminUser } from "@/lib/admin/types";
import { ThemeToggle } from "./theme-toggle";

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu({ user }: { user: AdminUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-accent/50 transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="w-9 h-9 ring-1 ring-border">
          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
          <AvatarFallback className="text-xs font-semibold bg-primary/15 text-primary">
            {initialsOf(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:flex flex-col items-start text-left min-w-0">
          <span className="text-sm font-medium truncate max-w-[10rem]">
            {user.name}
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-[10rem]">
            {user.email}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-medium">{user.name}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <User className="w-4 h-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <ThemeToggle />
        <DropdownMenuSeparator />
        <form action={logoutAction}>
          <button
            type="submit"
            className="relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden hover:bg-accent focus:bg-accent text-destructive"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
