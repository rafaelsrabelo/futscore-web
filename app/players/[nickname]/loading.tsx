import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlayerDetailLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <Header showBackButton />

      {/* Main Content */}
      <main className="flex-1">
        {/* Profile Header */}
        <div className="relative bg-linear-to-br from-card via-card to-card/50 border-b border-border/50">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Skeleton className="w-24 h-24 md:w-28 md:h-28 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-6 w-32" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-7 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-6">
            {/* Biography */}
            <Card>
              <CardContent className="pt-6 space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, i) => i).map((index) => (
                <Card key={`stat-${index}`}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Match Statistics */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  {Array.from({ length: 3 }, (_, i) => i).map((index) => (
                    <div key={`match-stat-${index}`} className="space-y-2">
                      <Skeleton className="h-10 w-16 mx-auto" />
                      <Skeleton className="h-4 w-20 mx-auto" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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

