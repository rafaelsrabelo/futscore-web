/**
 * Arte do lado direito do login. SVG de campo de futebol + gradient + copy.
 * Pra trocar por foto real: dropar `public/images/login-hero.jpg` e substituir
 * o bloco `<div className="absolute inset-0 ...">` por
 *   <Image src="/images/login-hero.jpg" alt="" fill className="object-cover" priority />
 */
export function LoginHero() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      <div className="absolute inset-0 bg-linear-to-br from-primary/30 via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-primary)_0%,transparent_50%)] opacity-20" />

      <svg
        className="absolute inset-0 w-full h-full text-primary/25"
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <g stroke="currentColor" strokeWidth="1.5" fill="none">
          <rect x="30" y="30" width="340" height="540" />
          <line x1="30" y1="300" x2="370" y2="300" />
          <circle cx="200" cy="300" r="60" />
          <circle cx="200" cy="300" r="2" fill="currentColor" />
          <rect x="110" y="30" width="180" height="80" />
          <rect x="150" y="30" width="100" height="20" />
          <rect x="110" y="490" width="180" height="80" />
          <rect x="150" y="550" width="100" height="20" />
          <path d="M 110 110 A 60 60 0 0 0 290 110" />
          <path d="M 110 490 A 60 60 0 0 1 290 490" />
        </g>
      </svg>

      <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />

      <div className="relative z-10 flex flex-col justify-end h-full p-12">
        <div className="space-y-4 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Painel admin · FutScore
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Conecte talento a{" "}
            <span className="bg-linear-to-r from-primary to-green-400 bg-clip-text text-transparent">
              oportunidade.
            </span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Gestão centralizada de atletas, olheiros, acessos e comunicados da
            plataforma.
          </p>
        </div>
      </div>
    </div>
  );
}
