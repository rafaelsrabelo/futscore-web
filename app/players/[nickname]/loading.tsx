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
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
              <Card>
                <CardContent className="pt-6 flex flex-col items-center gap-3">
                  <Skeleton className="w-28 h-28 rounded-full" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {Array.from({ length: 4 }, (_, i) => i).map((index) => (
                    <div
                      key={`personal-info-${index}`}
                      className="flex items-center justify-between"
                    >
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </aside>

            {/* Conteúdo principal */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
              {/* Biography */}
              <Card>
                <CardContent className="pt-6 space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>

              {/* Tabs */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-28 rounded-lg" />
                  <Skeleton className="h-9 w-24 rounded-lg" />
                  <Skeleton className="h-9 w-20 rounded-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-64 w-full rounded-lg" />
                  <Skeleton className="h-64 w-full rounded-lg" />
                </div>
              </div>
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
