import Image from "next/image";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { UserMenu } from "@/components/admin/user-menu";
import { requireSession } from "@/lib/admin/auth";

export default async function AdminAuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="flex min-h-screen">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b border-border/60 bg-background/80 backdrop-blur-sm">
          <div className="lg:hidden flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="FutScore"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="text-sm font-semibold">Admin</span>
          </div>
          <div className="hidden lg:block" />
          <UserMenu user={session.user} />
        </header>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
