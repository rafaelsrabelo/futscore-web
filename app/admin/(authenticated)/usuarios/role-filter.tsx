"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "ALL";

const OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: ALL, label: "Todos" },
  { value: "ATHLETE", label: "Atleta" },
  { value: "OBSERVER", label: "Olheiro" },
  { value: "none", label: "Sem role" },
];

export function RoleFilter({ active }: { active: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const current =
    OPTIONS.some((o) => o.value === active) && active !== ""
      ? active
      : ALL;

  function handleChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === ALL) params.delete("role");
    else params.set("role", next);
    params.delete("page");

    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger className="w-full md:w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
