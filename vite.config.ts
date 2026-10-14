// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Na VPS usamos o preset Node (rode o build com DEPLOY_TARGET=vps).
  // Sem essa variavel o Lovable continua usando o preset padrao dele.
  nitro: process.env["DEPLOY_TARGET"] === "vps" ? { preset: "node-server" } : undefined,
  // Dev-only: permite acessar o servidor por tunel (teste no celular).
  vite: {
    server: {
      allowedHosts: [".trycloudflare.com", ".loca.lt"],
    },
  },
});
