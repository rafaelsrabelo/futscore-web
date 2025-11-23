import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AthleteNotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="FutScore"
              width={140}
              height={40}
              priority
              className="object-contain"
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Atleta não encontrado</h1>
              <p className="text-muted-foreground">
                Não conseguimos encontrar o atleta que você está procurando.
                Verifique se o nome está correto ou tente buscar novamente.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/athletes" className="flex-1">
                <Button variant="default" className="w-full gap-2">
                  <Search className="w-4 h-4" />
                  Ver todos os atletas
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao início
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 FutScore. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

