import { createMiddleware } from "@tanstack/react-start";
import { ADMIN_TOKEN_HEADER } from "@/lib/admin-constants";
import { getAdminToken } from "@/lib/admin-auth";

// Precisa estar registrado como `functionMiddleware` global em `src/start.ts`;
// assim o navegador anexa o token do admin nas chamadas de server function.
export const attachAdminToken = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const token = getAdminToken();
  return next({ headers: token ? { [ADMIN_TOKEN_HEADER]: token } : {} });
});
