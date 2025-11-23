"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  AdvancedFiltersModal,
  type AthleteFilters,
} from "./advanced-filters-modal";

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

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Estado local para busca com debounce
  const [searchValue, setSearchValue] = useState(
    searchParams.get("nickname") || ""
  );
  
  const initialPosition = searchParams.get("primaryPosition");
  const [selectedPosition, setSelectedPosition] = useState<
    "GOALKEEPER" | "DEFENDER" | "MIDFIELDER" | "FORWARD" | undefined
  >(
    (initialPosition === "GOALKEEPER" || 
     initialPosition === "DEFENDER" || 
     initialPosition === "MIDFIELDER" || 
     initialPosition === "FORWARD") ? initialPosition : undefined
  );

  // Pegar filtros atuais da URL
  const getCurrentFilters = (): AthleteFilters => {
    const primaryPos = searchParams.get("primaryPosition");
    const genderParam = searchParams.get("gender");
    const footParam = searchParams.get("dominantFoot");
    
    return {
      nickname: searchParams.get("nickname") || undefined,
      primaryPosition: (primaryPos === "GOALKEEPER" || 
                       primaryPos === "DEFENDER" || 
                       primaryPos === "MIDFIELDER" || 
                       primaryPos === "FORWARD") ? primaryPos : undefined,
      gender: (genderParam === "MALE" || 
              genderParam === "FEMALE" || 
              genderParam === "OTHER") ? genderParam : undefined,
      dominantFoot: (footParam === "RIGHT" || footParam === "LEFT") ? footParam : undefined,
      minHeight: searchParams.get("minHeight")
        ? Number(searchParams.get("minHeight"))
        : undefined,
      maxHeight: searchParams.get("maxHeight")
        ? Number(searchParams.get("maxHeight"))
        : undefined,
      minWeight: searchParams.get("minWeight")
        ? Number(searchParams.get("minWeight"))
        : undefined,
      maxWeight: searchParams.get("maxWeight")
        ? Number(searchParams.get("maxWeight"))
        : undefined,
      hasManager:
        searchParams.get("hasManager") === "true"
          ? true
          : searchParams.get("hasManager") === "false"
          ? false
          : undefined,
    };
  };

  // Usar ref para evitar re-renders desnecessários
  const updateFiltersRef = useRef((newFilters: Partial<AthleteFilters>) => {
    const currentFilters = getCurrentFilters();
    const updatedFilters = { ...currentFilters, ...newFilters };

    const params = new URLSearchParams();

    // Adicionar todos os filtros aos query params
    for (const [key, value] of Object.entries(updatedFilters)) {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    }

    startTransition(() => {
      router.push(`/players${params.toString() ? `?${params}` : ""}`);
    });
  });

  // Atualizar a ref sempre que as dependências mudarem
  updateFiltersRef.current = (newFilters: Partial<AthleteFilters>) => {
    const currentFilters = getCurrentFilters();
    const updatedFilters = { ...currentFilters, ...newFilters };

    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(updatedFilters)) {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    }

    startTransition(() => {
      router.push(`/players${params.toString() ? `?${params}` : ""}`);
    });
  };

  const updateFilters = useCallback((newFilters: Partial<AthleteFilters>) => {
    updateFiltersRef.current(newFilters);
  }, []);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ nickname: searchValue || undefined });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, updateFilters]);

  const handlePositionClick = (position: "GOALKEEPER" | "DEFENDER" | "MIDFIELDER" | "FORWARD" | undefined) => {
    setSelectedPosition(position);
    updateFilters({ primaryPosition: position });
  };

  const handleAdvancedFiltersApply = (filters: AthleteFilters) => {
    updateFilters(filters);
    setSelectedPosition(filters.primaryPosition);
    setSearchValue(filters.nickname || "");
  };

  const activeFiltersCount = Object.values(getCurrentFilters()).filter(
    (v) => v !== undefined && v !== null && v !== ""
  ).length;

  return (
    <>
      <div className="space-y-4">
        {/* Busca e Botão de Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome ou apelido..."
              className="pl-10"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              disabled={isPending}
            />
          </div>
          <Button
            variant="outline"
            className="gap-2 relative"
            onClick={() => setShowAdvancedFilters(true)}
          >
            <Filter className="w-4 h-4" />
            Filtros Avançados
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Modal de Filtros Avançados */}
        <AdvancedFiltersModal
          open={showAdvancedFilters}
          onClose={() => setShowAdvancedFilters(false)}
          currentFilters={getCurrentFilters()}
          onApply={handleAdvancedFiltersApply}
        />
      </div>

      {/* Filtro Rápido por Posição - Fora do container para ir até a borda */}
      <div className="-mx-6">
        <div className="flex gap-2 overflow-x-auto pb-2 px-6 scrollbar-hide">
          {POSITION_OPTIONS.map((position) => (
            <Button
              key={position.label}
              variant={
                selectedPosition === position.value ? "default" : "outline"
              }
              size="sm"
              className="whitespace-nowrap shrink-0"
              onClick={() => handlePositionClick(position.value)}
              disabled={isPending}
            >
              {position.label}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}

