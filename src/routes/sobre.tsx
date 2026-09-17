import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre nós — Estrela Gourmet" },
      {
        name: "description",
        content: "Conheça a Estrela Gourmet, confeitaria artesanal de Vicentina, MS.",
      },
      { property: "og:title", content: "Sobre nós — Estrela Gourmet" },
      {
        property: "og:description",
        content: "Doces artesanais feitos com cuidado em Vicentina, MS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: About,
});
function About() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <Button variant="ghost" size="icon" asChild>
        <Link to="/">
          <ArrowLeft />
        </Link>
      </Button>
      <p className="mt-14 font-script text-4xl text-primary">Estrela Gourmet</p>
      <h1 className="font-display text-5xl font-semibold">Sobre nós</h1>
      <div className="mt-8 border-y border-gold/50 py-10">
        <Heart className="h-8 w-8 text-primary" />
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          A história oficial da confeitaria será apresentada aqui com as palavras e fotografias
          reais da proprietária.
        </p>
      </div>
    </main>
  );
}
