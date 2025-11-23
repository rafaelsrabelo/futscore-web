import { Header } from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayerListSkeleton } from "./player-card-skeleton";

export default function PlayersLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>

          {/* Filters */}
          <div className="space-y-4">
            {/* Busca e Botão de Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-full sm:w-[180px]" />
            </div>
          </div>

          {/* Filtro Rápido por Posição */}
          <div className="-mx-6">
            <div className="flex gap-2 overflow-x-auto pb-2 px-6">
              <Skeleton className="h-8 w-20 shrink-0" />
              <Skeleton className="h-8 w-24 shrink-0" />
              <Skeleton className="h-8 w-24 shrink-0" />
              <Skeleton className="h-8 w-28 shrink-0" />
              <Skeleton className="h-8 w-24 shrink-0" />
            </div>
          </div>

          {/* Players Grid */}
          <PlayerListSkeleton />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 FutScore. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

