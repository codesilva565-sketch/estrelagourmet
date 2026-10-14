import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { ADMIN_TOKEN_HEADER } from "@/lib/admin-constants";

// Autentica a proprietaria via token de sessao assinado (login por senha),
// e fornece o cliente Supabase com service role (bypassa RLS) para as acoes.
export const requireAdmin = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();
  const token = request?.headers?.get(ADMIN_TOKEN_HEADER);
  const { verifyAdminToken } = await import("@/lib/admin-session.server");
  if (!verifyAdminToken(token)) {
    throw new Error("Acesso restrito à proprietária.");
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return next({ context: { supabase: supabaseAdmin, userId: "owner" } });
});
