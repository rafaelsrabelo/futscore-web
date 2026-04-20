import Image from "next/image";
import { LoginForm } from "./login-form";
import { LoginHero } from "./login-hero";

export default function AdminLoginPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex flex-col items-start space-y-4">
            <Image
              src="/icon.png"
              alt="FutScore"
              width={96}
              height={96}
              priority
              className="object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold">FutScore Admin</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Entre com suas credenciais pra continuar.
              </p>
            </div>
          </div>

          <LoginForm />

          <p className="text-xs text-muted-foreground">
            Problemas pra acessar? Fale com o responsável da conta admin.
          </p>
        </div>
      </div>

      <div className="hidden lg:block">
        <LoginHero />
      </div>
    </div>
  );
}
