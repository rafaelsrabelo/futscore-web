import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Search, Smartphone, Users } from "lucide-react";
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
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
                  Acompanhe Sua{" "}
                  <span className="text-primary">Evolução</span>
                  {" "}no Campo
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg">
                  Registre partidas, compartilhe vídeos e mostre seu talento. 
                  Tudo em um só lugar para jogadores e olheiros.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="gap-2 h-12 text-base">
                  <Smartphone className="w-5 h-5" />
                  Baixar App
                </Button>
                <Link href="/players">
                  <Button size="lg" variant="outline" className="w-full h-12 text-base">
                    Explorar Jogadores
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Jogadores</p>
                    <p className="text-sm text-muted-foreground">Crie seu perfil</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Search className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Olheiros</p>
                    <p className="text-sm text-muted-foreground">Descubra talentos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-sm space-y-4">
                {/* Main Stats Card */}
                <div className="relative bg-linear-to-br from-card via-card to-card/80 border border-border/50 rounded-2xl p-6 shadow-2xl backdrop-blur-sm overflow-hidden">
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent" />
                  
                  <div className="relative space-y-6">
                    {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/20">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-base">Estatísticas</p>
                          <p className="text-xs text-muted-foreground">Temporada 2025</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-primary/10 rounded-full">
                        <span className="text-xs font-medium text-primary">Live</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="relative bg-linear-to-b from-muted/50 to-transparent rounded-xl p-3 text-center group hover:scale-105 transition-transform">
                        <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="text-3xl font-bold text-primary relative">24</p>
                        <p className="text-xs text-muted-foreground mt-1 relative">Partidas</p>
                      </div>
                      <div className="relative bg-linear-to-b from-muted/50 to-transparent rounded-xl p-3 text-center group hover:scale-105 transition-transform">
                        <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="text-3xl font-bold text-primary relative">18</p>
                        <p className="text-xs text-muted-foreground mt-1 relative">Gols</p>
                      </div>
                      <div className="relative bg-linear-to-b from-muted/50 to-transparent rounded-xl p-3 text-center group hover:scale-105 transition-transform">
                        <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="text-3xl font-bold text-primary relative">12</p>
                        <p className="text-xs text-muted-foreground mt-1 relative">Assists</p>
                      </div>
                    </div>

                    {/* Performance Bar */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Desempenho</span>
                        <span className="font-medium text-primary">92%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-[92%] bg-linear-to-r from-primary to-primary/60 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary Card - Video Highlight */}
                <div className="relative bg-linear-to-br from-card via-card to-card/80 border border-border/50 rounded-xl p-4 shadow-xl backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-colors">
                  <div className="absolute inset-0 bg-linear-to-br from-primary/3 via-transparent to-transparent" />
                  <div className="relative flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-primary border-b-4 border-b-transparent ml-0.5" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Últimos Destaques</p>
                      <p className="text-xs text-muted-foreground">12 vídeos disponíveis</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4">
        <div className="container mx-auto px-6 text-center text-xs text-muted-foreground">
          <p>© 2025 FutScore. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
