import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Criar nova senha — Estrela Gourmet" },
      { name: "description", content: "Crie uma nova senha para a área administrativa." },
      { property: "og:title", content: "Criar nova senha — Estrela Gourmet" },
      { property: "og:description", content: "Recuperação segura de acesso administrativo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ResetPassword,
});
function ResetPassword() {
  const navigate = useNavigate();
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const recovery =
      new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery" ||
      new URLSearchParams(window.location.search).get("type") === "recovery";
    void supabase.auth.getSession().then(({ data }) => setValid(recovery || Boolean(data.session)));
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setMessage("Use uma senha com pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setMessage("As senhas não são iguais.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage("O link expirou ou não foi possível alterar a senha.");
      setBusy(false);
      return;
    }
    await navigate({ to: "/admin", replace: true });
  }
  return (
    <main className="grid min-h-screen place-items-center bg-secondary px-4">
      <section className="w-full max-w-md rounded-lg border border-border bg-card p-7 soft-shadow">
        <LockKeyhole className="h-9 w-9 text-primary" />
        <h1 className="mt-4 font-display text-3xl font-semibold">Criar nova senha</h1>
        {valid ? (
          <form onSubmit={submit} className="mt-6 grid gap-4">
            <div>
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                minLength={8}
                maxLength={128}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirme a senha</Label>
              <Input
                id="confirm-password"
                type="password"
                minLength={8}
                maxLength={128}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-2"
              />
            </div>
            {message && (
              <p role="alert" className="text-sm text-destructive">
                {message}
              </p>
            )}
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />} Salvar nova senha
            </Button>
          </form>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Este link não é válido ou expirou.</p>
            <Button asChild className="mt-5">
              <Link to="/admin">Voltar ao acesso</Link>
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
