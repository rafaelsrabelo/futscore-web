"use client";

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
import { useState } from "react";

export interface AthleteFilters {
  nickname?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dominantFoot?: "RIGHT" | "LEFT";
  minHeight?: number;
  maxHeight?: number;
  minWeight?: number;
  maxWeight?: number;
  primaryPosition?: "GOALKEEPER" | "DEFENDER" | "MIDFIELDER" | "FORWARD";
  hasManager?: boolean;
}

interface AdvancedFiltersModalProps {
  open: boolean;
  onClose: () => void;
  currentFilters: AthleteFilters;
  onApply: (filters: AthleteFilters) => void;
}

const POSITION_OPTIONS: Array<{
  value: "GOALKEEPER" | "DEFENDER" | "MIDFIELDER" | "FORWARD" | undefined;
  label: string;
}> = [
  { value: undefined, label: "Todos" },
  { value: "GOALKEEPER", label: "Goleiro" },
  { value: "DEFENDER", label: "Defensor" },
  { value: "MIDFIELDER", label: "Meio-campo" },
  { value: "FORWARD", label: "Atacante" },
];

const FOOT_OPTIONS: Array<{
  value: "RIGHT" | "LEFT" | undefined;
  label: string;
}> = [
  { value: undefined, label: "Todos" },
  { value: "RIGHT", label: "Destro" },
  { value: "LEFT", label: "Canhoto" },
];

const GENDER_OPTIONS: Array<{
  value: "MALE" | "FEMALE" | "OTHER" | undefined;
  label: string;
}> = [
  { value: undefined, label: "Todos" },
  { value: "MALE", label: "Masculino" },
  { value: "FEMALE", label: "Feminino" },
  { value: "OTHER", label: "Outro" },
];

const MANAGER_OPTIONS: Array<{
  value: boolean | undefined;
  label: string;
}> = [
  { value: undefined, label: "Todos" },
  { value: true, label: "Com Empresário" },
  { value: false, label: "Sem Empresário" },
];

export function AdvancedFiltersModal({
  open,
  onClose,
  currentFilters,
  onApply,
}: AdvancedFiltersModalProps) {
  const [localFilters, setLocalFilters] =
    useState<AthleteFilters>(currentFilters);

  const updateFilter = <K extends keyof AthleteFilters>(
    key: K,
    value: AthleteFilters[K]
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({});
    onApply({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtros Avançados</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Posição Principal */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Posição Principal</Label>
            <div className="flex flex-wrap gap-2">
              {POSITION_OPTIONS.map((option) => (
                <Button
                  key={option.label}
                  type="button"
                  variant={
                    localFilters.primaryPosition === option.value
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => updateFilter("primaryPosition", option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Pé Dominante */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Pé Dominante</Label>
            <div className="flex flex-wrap gap-2">
              {FOOT_OPTIONS.map((option) => (
                <Button
                  key={option.label}
                  type="button"
                  variant={
                    localFilters.dominantFoot === option.value
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => updateFilter("dominantFoot", option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Gênero */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Gênero</Label>
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((option) => (
                <Button
                  key={option.label}
                  type="button"
                  variant={
                    localFilters.gender === option.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => updateFilter("gender", option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Altura */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Altura (cm)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minHeight" className="text-sm text-muted-foreground">
                  Mínimo
                </Label>
                <Input
                  id="minHeight"
                  type="number"
                  placeholder="150"
                  value={localFilters.minHeight || ""}
                  onChange={(e) =>
                    updateFilter(
                      "minHeight",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxHeight" className="text-sm text-muted-foreground">
                  Máximo
                </Label>
                <Input
                  id="maxHeight"
                  type="number"
                  placeholder="200"
                  value={localFilters.maxHeight || ""}
                  onChange={(e) =>
                    updateFilter(
                      "maxHeight",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Peso */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Peso (kg)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minWeight" className="text-sm text-muted-foreground">
                  Mínimo
                </Label>
                <Input
                  id="minWeight"
                  type="number"
                  placeholder="50"
                  value={localFilters.minWeight || ""}
                  onChange={(e) =>
                    updateFilter(
                      "minWeight",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxWeight" className="text-sm text-muted-foreground">
                  Máximo
                </Label>
                <Input
                  id="maxWeight"
                  type="number"
                  placeholder="100"
                  value={localFilters.maxWeight || ""}
                  onChange={(e) =>
                    updateFilter(
                      "maxWeight",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Empresário */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Empresário</Label>
            <div className="flex flex-wrap gap-2">
              {MANAGER_OPTIONS.map((option) => (
                <Button
                  key={option.label}
                  type="button"
                  variant={
                    localFilters.hasManager === option.value
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => updateFilter("hasManager", option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClear}>
            Limpar Filtros
          </Button>
          <Button onClick={handleApply}>Aplicar Filtros</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

