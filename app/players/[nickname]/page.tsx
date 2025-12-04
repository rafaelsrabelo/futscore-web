import { Header } from "@/components/header";
import { PlayerFieldPosition } from "@/components/player/player-field-position";
import { PlayerStatsCard } from "@/components/player/player-stats-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AthleteDetailResponse, Match, Position } from "@/lib/types";
import {
  Activity,
  Calendar,
  Check,
  Footprints,
  Heart,
  Play,
  Ruler,
  Shield,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MatchesList } from "./matches-list";

const API_URL = "https://futscout-api.onrender.com/api";

// Função auxiliar para verificar se é um UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

async function getAthleteByNickname(
  nickname: string
): Promise<AthleteDetailResponse | null> {
  try {
    // Se for um UUID, buscar diretamente pelo ID
    if (isUUID(nickname)) {
      const detailRes = await fetch(`${API_URL}/public/athletes/${nickname}`, {
        next: { revalidate: 60 },
      });

      if (!detailRes.ok) return null;

      return detailRes.json();
    }

    // Caso contrário, buscar por nickname
    const searchRes = await fetch(
      `${API_URL}/public/athletes?nickname=${nickname}`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const athlete = searchData.athletes.find(
      (a: { nickname: string }) => a.nickname?.toLowerCase() === nickname.toLowerCase()
    );

    if (!athlete) return null;

    // Agora buscar os detalhes completos pelo ID
    const detailRes = await fetch(`${API_URL}/public/athletes/${athlete.id}`, {
      next: { revalidate: 60 },
    });

    if (!detailRes.ok) return null;

    return detailRes.json();
  } catch (error) {
    console.error("Erro ao buscar atleta:", error);
    return null;
  }
}

const positionLabels: Record<Position, string> = {
  GOALKEEPER: "Goleiro",
  DEFENDER: "Defensor",
  MIDFIELDER: "Meio-campo",
  FORWARD: "Atacante",
};

const videoTypeLabels: Record<string, string> = {
  GOAL: "Gol",
  PASS: "Passe",
  DISTRIBUTION: "Distribuição",
  DIFFICULT_SAVE: "Defesa Difícil",
  BEST_MOMENTS: "Melhores Momentos",
};

export default async function AthleteDetailPage({
  params,
}: {
  params: Promise<{ nickname: string }>;
}) {
  const { nickname } = await params;
  const data = await getAthleteByNickname(nickname);

  if (!data) {
    notFound();
  }

  const { athlete } = data;

  // Calcular idade
  const age = athlete.birthDate
    ? Math.floor(
        (Date.now() - new Date(athlete.birthDate).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  // Calcular estatísticas das partidas
  const allMatches =
    athlete.finishedMatches?.flatMap((group) => group.matches) || [];
  const wins = allMatches.filter((m) => m.result === "WIN").length;
  const draws = allMatches.filter((m) => m.result === "DRAW").length;
  const losses = allMatches.filter((m) => m.result === "LOSS").length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {/* Profile Header - Modern Design */}
        <div className="relative bg-linear-to-br from-card via-card to-card/50 border-b border-border/50">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-6 py-8 relative">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Avatar */}
              <Avatar className="w-24 h-24 md:w-28 md:h-28 ring-2 ring-primary/20 shadow-xl">
                <AvatarImage
                  src={athlete.profilePhoto || undefined}
                  alt={athlete.user.name}
                />
                <AvatarFallback className="text-3xl font-semibold bg-linear-to-br from-primary/20 to-primary/5 text-primary">
                  {athlete.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold">{athlete.user.name}</h1>
                  {athlete.isPremium && (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-400">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {athlete.favorites > 0 && (
                    <div className="flex items-center gap-1.5 bg-muted/80 backdrop-blur-sm rounded-full px-3 py-1.5">
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      <span className="text-sm font-medium">
                        {athlete.favorites}
                      </span>
                    </div>
                  )}
                </div>
                
                {athlete.nickname && (
                  <p className="text-muted-foreground text-lg">@{athlete.nickname}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default" className="font-medium px-3 py-1">
                    {positionLabels[athlete.primaryPosition]}
                  </Badge>
                  {athlete.secondaryPosition && (
                    <Badge variant="secondary" className="px-3 py-1">
                      {positionLabels[athlete.secondaryPosition]}
                    </Badge>
                  )}
                  {athlete.currentClub && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground ml-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="font-medium">{athlete.currentClub}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-6">

            {/* Biography */}
            {athlete.biography && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sobre</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{athlete.biography}</p>
                </CardContent>
              </Card>
            )}

            {/* Stats Grid - Visual melhorado */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
                <CardContent className="pt-5 pb-4">
                  <div className="flex flex-col items-center text-center space-y-1.5">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                      <Ruler className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold bg-linear-to-br from-primary to-primary/80 bg-clip-text text-transparent">{athlete.height}cm</p>
                      <p className="text-xs text-muted-foreground font-medium">Altura</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
                <CardContent className="pt-5 pb-4">
                  <div className="flex flex-col items-center text-center space-y-1.5">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                      <Activity className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold bg-linear-to-br from-primary to-primary/80 bg-clip-text text-transparent">{athlete.weight}kg</p>
                      <p className="text-xs text-muted-foreground font-medium">Peso</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {age && (
                <Card className="relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex flex-col items-center text-center space-y-1.5">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                        <Calendar className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold bg-linear-to-br from-primary to-primary/80 bg-clip-text text-transparent">{age}</p>
                        <p className="text-xs text-muted-foreground font-medium">Anos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
                <CardContent className="pt-5 pb-4">
                  <div className="flex flex-col items-center text-center space-y-1.5">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                      <Footprints className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xl font-bold bg-linear-to-br from-primary to-primary/80 bg-clip-text text-transparent">
                        {athlete.dominantFoot === "RIGHT"
                          ? "Destro"
                          : athlete.dominantFoot === "LEFT"
                          ? "Canhoto"
                          : "Ambidestro"}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">Pé</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Grid - Layout adaptativo */}
            {allMatches.length > 0 ? (
              // Layout com partidas: 6-3-3 (50% - 25% - 25%)
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:items-stretch">
                {/* Coluna 1: Partidas Recentes (50%) */}
                <div className="lg:col-span-6 flex flex-col">
                  <div className="flex-1">
                    <MatchesList matches={allMatches as Match[]} />
                  </div>
                </div>

                {/* Coluna 2: Posição em Campo (25%) */}
                <div className="lg:col-span-3 flex flex-col">
                  <div className="flex-1">
                    <PlayerFieldPosition position={athlete.primaryPosition} />
                  </div>
                </div>

                {/* Coluna 3: Estatísticas (25%) */}
                <div className="lg:col-span-3 flex flex-col">
                  <div className="flex-1">
                    <PlayerStatsCard
                      wins={wins}
                      draws={draws}
                      losses={losses}
                      totalMatches={allMatches.length}
                      averageRating={
                        allMatches.some(m => m.performanceRating)
                          ? allMatches
                              .filter(m => m.performanceRating)
                              .reduce((acc, m) => acc + (m.performanceRating || 0), 0) /
                            allMatches.filter(m => m.performanceRating).length
                          : undefined
                      }
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Layout sem partidas: Campo centralizado + Estados vazios
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Campo centralizado */}
                <div className="lg:col-span-1">
                  <PlayerFieldPosition position={athlete.primaryPosition} />
                </div>

                {/* Estado vazio: Sem Partidas */}
                <Card className="lg:col-span-2 border-dashed border-2 border-muted-foreground/20 bg-muted/20">
                  <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Trophy className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Nenhuma partida registrada</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Este atleta ainda não possui partidas cadastradas. As estatísticas e 
                      histórico de jogos aparecerão aqui após o primeiro jogo ser adicionado.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Video Feed */}
            {athlete.videoFeed && athlete.videoFeed.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-primary" />
                    Vídeos ({athlete.videoFeed.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {athlete.videoFeed.slice(0, 8).map((video) => (
                      <div
                        key={video.id}
                        className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer bg-muted"
                      >
                        <Image
                          src={video.thumbnailUrl}
                          alt={videoTypeLabels[video.type] || video.type}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="w-6 h-6 text-black ml-1" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <Badge variant="secondary" className="text-xs">
                            {videoTypeLabels[video.type] || video.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
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

