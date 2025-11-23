import { Header } from "@/components/header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Star, Trophy } from "lucide-react";
import Link from "next/link";

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
                <Button size="lg" className="gap-2">
                  Criar Meu Perfil
                </Button>
                <Link href="/players">
                  <Button variant="outline" size="lg" className="gap-2">
                    Explorar Atletas
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side - Visual Mockup */}
            <div className="hidden lg:flex items-center justify-center relative h-[500px]">
              {/* Background blur circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-96 h-96 rounded-full bg-primary/10 blur-3xl opacity-50 animate-pulse-slow" />
              </div>

              {/* Mockup Card 1 - Player Card */}
              <Card className="absolute w-[320px] bg-background/80 backdrop-blur-md shadow-xl rotate-3 hover:rotate-0 transition-all duration-300 ease-in-out z-10 border-primary/20">
                <CardContent className="p-0">
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent" />
                  
                  {/* Profile Header */}
                  <div className="relative p-4 pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <Avatar className="w-12 h-12 ring-2 ring-primary/30">
                        <AvatarFallback className="text-sm font-semibold bg-linear-to-br from-primary/20 to-primary/5 text-primary">
                          LF
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-muted rounded-full px-2 py-0.5">
                          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                          <span className="text-xs font-medium">45</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Meio-campo
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-semibold text-base leading-tight">
                        Lucas Ferreira
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        @lucasf10
                      </p>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="px-4 pb-3">
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        <span className="font-medium">178cm</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        <span className="font-medium">72kg</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        <span className="font-medium">Destro</span>
                      </div>
                    </div>
                  </div>

                  {/* Club Info */}
                  <div className="px-4 pb-4 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-xs">
                      <MapPin className="w-3 h-3 text-primary" />
                      <span className="text-muted-foreground font-medium">
                        Flamengo Sub-17
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mockup Card 2 - Player Stats */}
              <Card className="absolute w-[300px] bg-background/80 backdrop-blur-md shadow-lg -rotate-6 hover:rotate-0 transition-all duration-300 ease-in-out -bottom-10 right-0 z-0 border-primary/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Estatísticas</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-green-500">15</p>
                      <p className="text-xs text-muted-foreground">Vitórias</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-yellow-500">3</p>
                      <p className="text-xs text-muted-foreground">Empates</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-red-500">2</p>
                      <p className="text-xs text-muted-foreground">Derrotas</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Avaliação média:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i <= 4 ? "fill-primary text-primary" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                        <span className="font-medium ml-1">4.0</span>
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
