import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  showBackButton?: boolean;
  backUrl?: string;
}

export function Header({ showBackButton = false, backUrl = "/players" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/icon.png"
            alt="FutScore"
            width={75}
            height={75}
            priority
            className="object-contain"
          />
        </Link>
        
        {showBackButton && (
          <Link href={backUrl}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}

