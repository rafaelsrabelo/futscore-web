"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
}

export function Pagination({ currentPage, totalPages, total }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/players?${params.toString()}`);
  };

  // Se só tiver 1 página, não mostra a paginação
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: Array<{ value: number | string; key: string }> = [];
    
    if (totalPages <= 7) {
      // Se tiver 7 ou menos páginas, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push({ value: i, key: `page-${i}` });
      }
    } else {
      // Sempre mostra primeira página
      pages.push({ value: 1, key: "page-1" });

      if (currentPage > 3) {
        pages.push({ value: "...", key: "ellipsis-start" });
      }

      // Páginas ao redor da atual
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push({ value: i, key: `page-${i}` });
      }

      if (currentPage < totalPages - 2) {
        pages.push({ value: "...", key: "ellipsis-end" });
      }

      // Sempre mostra última página
      pages.push({ value: totalPages, key: `page-${totalPages}` });
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
      <div className="text-sm text-muted-foreground">
        Mostrando página <span className="font-medium">{currentPage}</span> de{" "}
        <span className="font-medium">{totalPages}</span> ({total} jogador
        {total !== 1 ? "es" : ""} no total)
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page) => {
            if (page.value === "...") {
              return (
                <div key={page.key} className="px-2 text-muted-foreground">
                  ...
                </div>
              );
            }

            return (
              <Button
                key={page.key}
                variant={currentPage === page.value ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page.value as number)}
                className="w-9 h-9"
              >
                {page.value}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="gap-1"
        >
          Próxima
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

