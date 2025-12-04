import { Header } from "@/components/header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, BarChart3, Eye, Footprints, Heart, Ruler, Shield, Star, Trophy, Video } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex items-center">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8 text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Transforme Seu Talento{" "}
                <span className="bg-linear-to-r from-primary to-green-400 bg-clip-text text-transparent">
                  Em Oportunidades
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Crie seu perfil profissional, compartilhe vídeos dos seus melhores lances e seja descoberto por clubes e observadores do futebol.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a 
                  href="https://apps.apple.com/us/app/futscore/id6754995110" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button size="lg" className="w-full sm:w-auto group relative overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                      Baixar na App Store
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">NOVO</Badge>
                    </span>
                    <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </a>
                <a 
                  href="https://play.google.com/store/apps/details?id=com.futscore.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button variant="outline" size="lg" className="w-full sm:w-auto group hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <span className="group-hover:text-primary transition-colors">Baixar no Google Play</span>
                  </Button>
                </a>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-2 gap-4 pt-4 max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">Vídeos & Highlights</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">Estatísticas Completas</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">Visibilidade Total</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">Perfil Profissional</span>
                </div>
              </div>
            </div>

            {/* Right Side - Visual Mockup */}
            <div className="hidden lg:flex items-center justify-center relative h-[500px]">
              {/* Background blur circles - animated */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-96 h-96 rounded-full bg-primary/10 blur-3xl opacity-50 animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="absolute w-64 h-64 rounded-full bg-primary/5 blur-2xl opacity-30 animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
              </div>

              {/* Mockup Card 1 - Player Card (Design Atualizado) */}
              <Card className="absolute w-[320px] bg-background/90 backdrop-blur-md shadow-2xl rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-500 ease-out z-10 border-primary/20 hover:border-primary/40 hover:shadow-primary/20">
                <CardContent className="p-0">
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Profile Header */}
                  <div className="relative p-4 pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <Avatar className="w-12 h-12 ring-2 ring-primary/20 shadow-lg">
                        <AvatarFallback className="text-sm font-bold bg-linear-to-br from-primary/20 to-primary/5 text-primary">
                          LF
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 bg-muted/80 backdrop-blur-sm rounded-full px-2 py-0.5 shadow-sm">
                          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                          <span className="text-xs font-bold">45</span>
                        </div>
                        <Badge variant="default" className="text-xs font-semibold shadow-sm">
                          Meio-campo
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-base leading-tight">
                        Lucas Ferreira
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        @lucasf10
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid - Novo Design */}
                  <div className="px-4 pb-3">
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="flex flex-col items-center p-1.5 rounded-lg bg-muted/50 backdrop-blur-sm border border-border/50">
                        <div className="w-6 h-6 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-0.5">
                          <Ruler className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-xs font-bold">178cm</span>
                      </div>
                      <div className="flex flex-col items-center p-1.5 rounded-lg bg-muted/50 backdrop-blur-sm border border-border/50">
                        <div className="w-6 h-6 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-0.5">
                          <Activity className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-xs font-bold">72kg</span>
                      </div>
                      <div className="flex flex-col items-center p-1.5 rounded-lg bg-muted/50 backdrop-blur-sm border border-border/50">
                        <div className="w-6 h-6 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-0.5">
                          <Footprints className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-[10px] font-bold">Destro</span>
                      </div>
                    </div>
                  </div>

                  {/* Club Info */}
                  <div className="px-4 pb-4 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <Shield className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground font-semibold text-xs">
                        Flamengo Sub-17
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mockup Card 2 - Player Stats (Melhorado) */}
              <Card className="absolute w-[300px] bg-background/90 backdrop-blur-md shadow-xl -rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-500 ease-out -bottom-10 right-0 z-0 border-primary/20 hover:border-primary/40 hover:shadow-primary/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                      <Trophy className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-bold">Estatísticas</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-2xl font-bold text-green-500">15</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Vitórias</p>
                    </div>
                    <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-2xl font-bold text-yellow-500">3</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Empates</p>
                    </div>
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-2xl font-bold text-red-500">2</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Derrotas</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Avaliação:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i <= 4 ? "fill-primary text-primary" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                        <span className="font-bold ml-1 text-primary">4.0</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-border/40 text-center text-sm text-muted-foreground">
        <p>© 2025 FutScore. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
