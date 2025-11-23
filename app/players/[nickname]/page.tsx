import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AthleteDetailResponse, Position } from "@/lib/types";
import {
  Calendar,
  Heart,
  MapPin,
  Play,
  Ruler,
  Star,
  TrendingUp,
  Trophy,
  Weight,
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

const API_URL = "https://futscout-api.onrender.com/api";

async function getAthleteByNickname(
  nickname: string
): Promise<AthleteDetailResponse | null> {
  try {
    // Primeiro, buscar todos os atletas para pegar o ID pelo nickname
    const searchRes = await fetch(
      `${API_URL}/public/athletes?search=${nickname}`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const athlete = searchData.athletes.find(
      (a: { nickname: string }) => a.nickname.toLowerCase() === nickname.toLowerCase()
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
      <Header showBackButton />

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
                      <MapPin className="w-4 h-4 text-primary" />
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

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Ruler className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{athlete.height}cm</p>
                      <p className="text-xs text-muted-foreground">Altura</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Weight className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{athlete.weight}kg</p>
                      <p className="text-xs text-muted-foreground">Peso</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {age && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{age}</p>
                        <p className="text-xs text-muted-foreground">Anos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {athlete.dominantFoot === "RIGHT"
                          ? "Destro"
                          : athlete.dominantFoot === "LEFT"
                          ? "Canhoto"
                          : "Ambidestro"}
                      </p>
                      <p className="text-xs text-muted-foreground">Pé</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Position Map & Match Statistics - Compact Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Position Map (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Posição em Campo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-2/3 max-w-sm mx-auto bg-linear-to-b from-green-900/20 to-green-950/20 rounded-lg border-2 border-green-500/20 overflow-hidden">
                      {/* Field Lines */}
                      <div className="absolute inset-0">
                        {/* Center Line */}
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-green-500/30" />
                        {/* Center Circle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-green-500/30" />
                        {/* Penalty Areas */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-16 border-b border-x border-green-500/30" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-16 border-t border-x border-green-500/30" />
                      </div>
                      
                      {/* Player Position Marker */}
                      <div 
                        className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 transition-all"
                        style={{
                          left: "50%",
                          top: athlete.primaryPosition === "GOALKEEPER" ? "10%" :
                               athlete.primaryPosition === "DEFENDER" ? "30%" :
                               athlete.primaryPosition === "MIDFIELDER" ? "55%" :
                               athlete.primaryPosition === "FORWARD" ? "80%" : "50%"
                        }}
                      >
                        <div className="relative w-full h-full">
                          <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-30" />
                          <div className="relative w-full h-full bg-primary rounded-full border-2 border-primary-foreground flex items-center justify-center shadow-lg shadow-primary/50">
                            <span className="text-xs font-bold text-primary-foreground text-center leading-tight">
                              {athlete.primaryPosition === "GOALKEEPER" ? "GOL" :
                               athlete.primaryPosition === "DEFENDER" ? "DEF" :
                               athlete.primaryPosition === "MIDFIELDER" ? "MEI" :
                               athlete.primaryPosition === "FORWARD" ? "ATA" : "?"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Statistics & Recent Matches (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Match Statistics */}
                {allMatches.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Estatísticas de Partidas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                          <p className="text-3xl font-bold text-green-500">
                            {wins}
                          </p>
                          <p className="text-sm text-muted-foreground">Vitórias</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-3xl font-bold text-yellow-500">
                            {draws}
                          </p>
                          <p className="text-sm text-muted-foreground">Empates</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-3xl font-bold text-red-500">
                            {losses}
                          </p>
                          <p className="text-sm text-muted-foreground">Derrotas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Matches */}
                {allMatches.length > 0 && (
                  <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        Partidas Recentes
                      </span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {allMatches.length} partidas
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {allMatches.slice(0, 10).map((match) => (
                      <div
                        key={match.id}
                        className="relative group hover:bg-muted/50 rounded-lg p-4 transition-colors border border-border/50"
                      >
                        {/* Top Row - Date, Teams and Result */}
                        <div className="flex items-center gap-3">
                          {/* Date and Category */}
                          <div className="flex flex-col gap-1 w-20 shrink-0">
                            <p className="text-xs font-medium text-muted-foreground">
                              {new Date(match.date).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                              })}
                            </p>
                            <Badge variant="outline" className="text-xs w-fit px-1.5 py-0">
                              {match.category}
                            </Badge>
                          </div>

                          {/* Teams and Score */}
                          <div className="flex-1 flex flex-col gap-2">
                            {/* Home Team */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-sm">{match.myTeam.name}</span>
                              {match.result !== "NOT_FINISHED" && (
                                <span className="text-lg font-bold w-6 text-right">
                                  {match.myTeamScore}
                                </span>
                              )}
                            </div>
                            
                            {/* Away Team */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-sm text-muted-foreground">
                                {match.adversaryTeam}
                              </span>
                              {match.result !== "NOT_FINISHED" ? (
                                <span className="text-lg font-bold w-6 text-right text-muted-foreground">
                                  {match.adversaryScore}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">vs</span>
                              )}
                            </div>
                          </div>

                          {/* Result Badge */}
                          <div className="shrink-0">
                            {match.result === "WIN" && (
                              <div className="w-8 h-8 rounded-md bg-green-500/10 flex items-center justify-center">
                                <span className="text-green-500 font-bold text-sm">V</span>
                              </div>
                            )}
                            {match.result === "DRAW" && (
                              <div className="w-8 h-8 rounded-md bg-yellow-500/10 flex items-center justify-center">
                                <span className="text-yellow-500 font-bold text-sm">E</span>
                              </div>
                            )}
                            {match.result === "LOSS" && (
                              <div className="w-8 h-8 rounded-md bg-red-500/10 flex items-center justify-center">
                                <span className="text-red-500 font-bold text-sm">D</span>
                              </div>
                            )}
                            {match.result === "NOT_FINISHED" && (
                              <Badge variant="outline" className="text-xs">
                                Agendado
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Bottom Row - Additional Info */}
                        {(match.location || match.performanceRating) && (
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50 text-xs">
                            {match.location && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{match.location}</span>
                              </div>
                            )}
                            {match.performanceRating && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Avaliação:</span>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }, (_, i) => i).map((index) => (
                                    <Star
                                      key={`star-${match.id}-${index}`}
                                      className={`w-3.5 h-3.5 ${
                                        match.performanceRating && index < match.performanceRating
                                          ? "fill-primary text-primary"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="font-medium text-foreground">
                                  {match.performanceRating}.0
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
                )}
              </div>
            </div>

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

