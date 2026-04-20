"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface AdvancedFilterValues {
  gender: string; // "" | MALE | FEMALE | OTHER
  dominantFoot: string; // "" | LEFT | RIGHT
  currentClub: string;
  hasManager: string; // "" | "true" | "false"
  minAge: string;
  maxAge: string;
  minHeight: string; // metros
  maxHeight: string;
  minWeight: string; // kg
  maxWeight: string;
}

const EMPTY: AdvancedFilterValues = {
  gender: "",
  dominantFoot: "",
  currentClub: "",
  hasManager: "",
  minAge: "",
  maxAge: "",
  minHeight: "",
  maxHeight: "",
  minWeight: "",
  maxWeight: "",
};

export function countActiveFilters(v: AdvancedFilterValues): number {
  return Object.values(v).filter((value) => value.trim() !== "").length;
}

export function AdvancedFilters({
  current,
  totalResults,
}: {
  current: AdvancedFilterValues;
  totalResults: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AdvancedFilterValues>(current);

  useEffect(() => {
    if (open) setForm(current);
  }, [open, current]);

  const activeCount = countActiveFilters(current);

  function set<K extends keyof AdvancedFilterValues>(
    key: K,
    value: AdvancedFilterValues[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function apply() {
    const next = new URLSearchParams(searchParams.toString());
    (Object.keys(form) as (keyof AdvancedFilterValues)[]).forEach((key) => {
      const value = form[key].trim();
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setOpen(false);
  }

  function clearAll() {
    setForm(EMPTY);
  }

  function removeActive() {
    const next = new URLSearchParams(searchParams.toString());
    (Object.keys(EMPTY) as (keyof AdvancedFilterValues)[]).forEach((key) =>
      next.delete(key)
    );
    next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <>
      <div className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border bg-card/40 px-3 py-2 text-sm transition-colors",
            activeCount > 0
              ? "border-primary/50 text-foreground"
              : "border-border/60 hover:bg-accent/40"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros avançados
          <span className="rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5">
            {activeCount > 0 ? activeCount : totalResults}
          </span>
        </button>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={removeActive}
            aria-label="Limpar filtros avançados"
            className="inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpar
          </button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Filtros avançados</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Field label="Gênero">
              <EnumSelect
                value={form.gender}
                onChange={(v) => set("gender", v)}
                options={[
                  { value: "MALE", label: "Masculino" },
                  { value: "FEMALE", label: "Feminino" },
                  { value: "OTHER", label: "Outro" },
                ]}
              />
            </Field>

            <Field label="Perna dominante">
              <EnumSelect
                value={form.dominantFoot}
                onChange={(v) => set("dominantFoot", v)}
                options={[
                  { value: "RIGHT", label: "Destro" },
                  { value: "LEFT", label: "Canhoto" },
                ]}
              />
            </Field>

            <Field label="Empresário" className="md:col-span-2">
              <SegmentedControl
                value={form.hasManager}
                onChange={(v) => set("hasManager", v)}
                options={[
                  { value: "", label: "Qualquer" },
                  { value: "true", label: "Com empresário" },
                  { value: "false", label: "Sem empresário" },
                ]}
              />
            </Field>

            <Field label="Clube atual" className="md:col-span-2">
              <Input
                type="text"
                value={form.currentClub}
                onChange={(e) => set("currentClub", e.target.value)}
                placeholder="ex.: Flamengo"
              />
            </Field>

            <RangeField
              label="Idade (anos)"
              min={form.minAge}
              max={form.maxAge}
              onMin={(v) => set("minAge", v)}
              onMax={(v) => set("maxAge", v)}
              step={1}
              minPlaceholder="0"
              maxPlaceholder="50"
            />

            <RangeField
              label="Altura (metros)"
              min={form.minHeight}
              max={form.maxHeight}
              onMin={(v) => set("minHeight", v)}
              onMax={(v) => set("maxHeight", v)}
              step={0.01}
              minPlaceholder="1.40"
              maxPlaceholder="2.20"
            />

            <RangeField
              label="Peso (kg)"
              min={form.minWeight}
              max={form.maxWeight}
              onMin={(v) => set("minWeight", v)}
              onMax={(v) => set("maxWeight", v)}
              step={0.1}
              minPlaceholder="40"
              maxPlaceholder="120"
              className="md:col-span-2"
            />
          </div>

          <DialogFooter className="mt-4 flex-row justify-between">
            <Button variant="ghost" onClick={clearAll} disabled={countActiveFilters(form) === 0}>
              Limpar tudo
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={apply}>Aplicar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs text-muted-foreground font-medium">
        {label}
      </Label>
      {children}
    </div>
  );
}

function EnumSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const CLEAR = "__clear__";
  return (
    <Select
      value={value || CLEAR}
      onValueChange={(v) => onChange(v === CLEAR ? "" : v)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Qualquer" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={CLEAR}>Qualquer</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SegmentedControl({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-md border border-border/60 bg-card/30 p-1">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-3 py-1.5 rounded text-xs transition-colors",
              active
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function RangeField({
  label,
  min,
  max,
  onMin,
  onMax,
  step,
  minPlaceholder,
  maxPlaceholder,
  className,
}: {
  label: string;
  min: string;
  max: string;
  onMin: (v: string) => void;
  onMax: (v: string) => void;
  step: number;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  className?: string;
}) {
  return (
    <Field label={label} className={className}>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          step={step}
          min={0}
          value={min}
          onChange={(e) => onMin(e.target.value)}
          placeholder={minPlaceholder}
        />
        <span className="text-xs text-muted-foreground">até</span>
        <Input
          type="number"
          inputMode="decimal"
          step={step}
          min={0}
          value={max}
          onChange={(e) => onMax(e.target.value)}
          placeholder={maxPlaceholder}
        />
      </div>
    </Field>
  );
}
