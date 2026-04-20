import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_HEADER } from "./constants";
import type { AdminSession, VerifyPayload } from "./types";

export type { AdminSession, AdminUser } from "./types";

/**
 * Lê a sessão já validada pelo middleware (`proxy.ts`). O header
 * `x-admin-session` é escrito lá após `/admin/auth/verify` 200.
 * Retorno `null` = usuário não autenticado ou sem role admin.
 */
export async function getSession(): Promise<AdminSession | null> {
  const h = await headers();
  const raw = h.get(SESSION_HEADER);
  if (!raw) return null;

  try {
    const payload = JSON.parse(raw) as VerifyPayload;
    return {
      user: {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        name: payload.email.split("@")[0],
        avatarUrl: null,
      },
    };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}
