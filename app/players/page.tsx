import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { AthletesResponse, Position } from "@/lib/types";
import { Activity, Footprints, Heart, Ruler, Search, Shield } from "lucide-react";
import Link from "next/link";
import { Pagination } from "./pagination";
import { SearchFilters } from "./search-filters";

const API_URL = "https://futscout-api.onrender.com/api";

interface AthleteSearchParams {
  nickname?: string;
  gender?: string;
  dominantFoot?: string;
  minHeight?: string;
  maxHeight?: string;
  minWeight?: string;
  maxWeight?: string;
  primaryPosition?: string;
  hasManager?: string;
  page?: string;
  limit?: string;
}

async function getAthletes(
  searchParams?: AthleteSearchParams
): Promise<AthletesResponse> {
  const params = new URLSearchParams();

  // Adicionar todos os parâmetros de filtro disponíveis
  if (searchParams?.nickname) params.set("nickname", searchParams.nickname);
  if (searchParams?.primaryPosition)
    params.set("primaryPosition", searchParams.primaryPosition);
  if (searchParams?.gender) params.set("gender", searchParams.gender);
  if (searchParams?.dominantFoot)
    params.set("dominantFoot", searchParams.dominantFoot);
  if (searchParams?.minHeight) params.set("minHeight", searchParams.minHeight);
  if (searchParams?.maxHeight) params.set("maxHeight", searchParams.maxHeight);
  if (searchParams?.minWeight) params.set("minWeight", searchParams.minWeight);
  if (searchParams?.maxWeight) params.set("maxWeight", searchParams.maxWeight);
  if (searchParams?.hasManager)
    params.set("hasManager", searchParams.hasManager);
  if (searchParams?.page) params.set("page", searchParams.page);
  if (searchParams?.limit) params.set("limit", searchParams.limit);

  const url = `${API_URL}/public/athletes${params.toString() ? `?${params}` : ""}`;

  const res = await fetch(url, {
    next: { revalidate: 60 }, // Cache por 60 segundos
  });

  if (!res.ok) {
    throw new Error("Falha ao carregar atletas");
  }

  return res.json();
}

const positionLabels: Record<Position, string> = {
  GOALKEEPER: "Goleiro",
  DEFENDER: "Defensor",
  MIDFIELDER: "Meio-campo",
  FORWARD: "Atacante",
};

export default async function AthletesPage({
  searchParams,
}: {
  searchParams: Promise<AthleteSearchParams>;
}) {
  const params = await searchParams;
  const data = await getAthletes(params);

  const currentPage = Number(params.page) || 1;
  const totalPages = Math.ceil(data.pagination.total / data.pagination.limit);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Explorar Jogadores</h1>
            <p className="text-muted-foreground">
              {data.pagination.total} jogadores encontrados
            </p>
          </div>

          {/* Filters */}
          <SearchFilters />

          {/* Players Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.athletes.map((athlete) => (
              <Link
                key={athlete.id}
                href={`/players/${athlete.nickname}`}
                className="group h-full"
              >
                <Card className="relative overflow-hidden h-full flex flex-col border-primary/10 bg-linear-to-br from-primary/5 to-transparent hover:border-primary/30 transition-all group-hover:shadow-xl group-hover:shadow-primary/10">
                  <CardContent className="p-0 flex-1 flex flex-col">
                    {/* Gradient Background on Hover */}
                    <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Profile Header */}
                    <div className="relative p-5 pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <Avatar className="w-14 h-14 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all shadow-lg">
                          <AvatarImage
                            src={athlete.profilePhoto || undefined}
                            alt={athlete.user.name}
                          />
                          <AvatarFallback className="text-base font-bold bg-linear-to-br from-primary/20 to-primary/5 text-primary">
                            {athlete.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex flex-col items-end gap-1.5">
                          {athlete.favorites > 0 && (
                            <div className="flex items-center gap-1 bg-muted/80 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm">
                              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                              <span className="text-xs font-bold">
                                {athlete.favorites}
                              </span>
                            </div>
                          )}
                          <Badge variant="default" className="text-xs font-semibold shadow-sm">
                            {positionLabels[athlete.primaryPosition]}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors leading-tight line-clamp-1">
                          {athlete.user.name}
                        </h3>
                        {athlete.nickname && (
                          <p className="text-sm text-muted-foreground font-medium">
                            @{athlete.nickname}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats Grid - Visual melhorado */}
                    <div className="px-5 pb-4">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50 backdrop-blur-sm border border-border/50 group-hover:border-primary/20 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-1">
                            <Ruler className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-xs font-bold text-foreground">{athlete.height}cm</span>
                          <span className="text-[10px] text-muted-foreground">Altura</span>
                        </div>
                        
                        <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50 backdrop-blur-sm border border-border/50 group-hover:border-primary/20 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-1">
                            <Activity className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-xs font-bold text-foreground">{athlete.weight}kg</span>
                          <span className="text-[10px] text-muted-foreground">Peso</span>
                        </div>
                        
                        <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50 backdrop-blur-sm border border-border/50 group-hover:border-primary/20 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-1">
                            <Footprints className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-[10px] font-bold text-foreground leading-tight text-center">
                            {athlete.dominantFoot === "RIGHT"
                              ? "Destro"
                              : athlete.dominantFoot === "LEFT"
                              ? "Canhoto"
                              : "Ambidestro"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">Pé</span>
                        </div>
                      </div>
                    </div>

                    {/* Club Info */}
                    <div className="mt-auto px-5 pb-5 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <Shield className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-muted-foreground font-semibold text-xs truncate">
                          {athlete.currentClub || "Sem clube"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {data.athletes.length === 0 && (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Nenhum jogador encontrado
                </h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou a busca
                </p>
              </div>
            </div>
          )}

          {/* Pagination */}
          {data.athletes.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={data.pagination.total}
            />
          )}
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

