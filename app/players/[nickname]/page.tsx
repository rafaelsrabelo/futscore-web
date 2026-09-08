import { Header } from "@/components/header";
import { PlayerFieldPosition } from "@/components/player/player-field-position";
import { PlayerSidebar } from "@/components/player/player-sidebar";
import { PlayerStatsCard } from "@/components/player/player-stats-card";
import { PlayerVideoStats } from "@/components/player/player-video-stats";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { videoTypeLabels } from "@/lib/labels";
import type { AthleteDetailResponse } from "@/lib/types";
import { Play, Trophy } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MatchesList } from "./matches-list";

const API_URL =
  process.env.API_URL ?? "https://futscout-api.onrender.com/api";

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
  const matchGroups = athlete.finishedMatches || [];
  const allMatches = matchGroups.flatMap((group) => group.matches);
  const wins = allMatches.filter((m) => m.result === "WIN").length;
  const draws = allMatches.filter((m) => m.result === "DRAW").length;
  const losses = allMatches.filter((m) => m.result === "LOSS").length;
  const videoFeed = athlete.videoFeed || [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <aside className="lg:col-span-4 xl:col-span-3">
              <div className="lg:sticky lg:top-24">
                <PlayerSidebar athlete={athlete} age={age} />
              </div>
            </aside>

            {/* Conteúdo principal */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
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

              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="matches">Partidas</TabsTrigger>
                  <TabsTrigger value="videos">Vídeos</TabsTrigger>
                </TabsList>

                {/* Visão Geral */}
                <TabsContent value="overview" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PlayerFieldPosition position={athlete.primaryPosition} />
                    <PlayerStatsCard
                      wins={wins}
                      draws={draws}
                      losses={losses}
                      totalMatches={allMatches.length}
                      averageRating={
                        allMatches.some((m) => m.performanceRating)
                          ? allMatches
                              .filter((m) => m.performanceRating)
                              .reduce((acc, m) => acc + (m.performanceRating || 0), 0) /
                            allMatches.filter((m) => m.performanceRating).length
                          : undefined
                      }
                    />
                  </div>
                </TabsContent>

                {/* Partidas */}
                <TabsContent value="matches" className="mt-4">
                  {allMatches.length > 0 ? (
                    <MatchesList groups={matchGroups} />
                  ) : (
                    <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/20">
                      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Trophy className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          Nenhuma partida registrada
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Este atleta ainda não possui partidas cadastradas. As
                          estatísticas e histórico de jogos aparecerão aqui após
                          o primeiro jogo ser adicionado.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Vídeos */}
                <TabsContent value="videos" className="mt-4">
                  {videoFeed.length > 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Play className="w-5 h-5 text-primary" />
                          Vídeos ({videoFeed.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <PlayerVideoStats videoFeed={videoFeed} />

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {videoFeed.slice(0, 8).map((video) => (
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
                  ) : (
                    <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/20">
                      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Play className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          Nenhum vídeo cadastrado
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Os vídeos de lances deste atleta aparecerão aqui assim
                          que forem cadastrados.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
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
