import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useInterest } from "@/lib/interest-context";
import { getCatalog } from "@/lib/catalog.functions";

export const Route = createFileRoute("/interesse")({
  loader: () => getCatalog(),
  head: () => ({
    meta: [
      { title: "Lista de interesse — Estrela Gourmet" },
      {
        name: "description",
        content: "Organize seus doces e envie uma consulta de encomenda à Estrela Gourmet.",
      },
      { property: "og:title", content: "Lista de interesse — Estrela Gourmet" },
      {
        property: "og:description",
        content: "Envie sua consulta de encomenda de doces artesanais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InterestPage,
});

function InterestPage() {
  const { settings } = Route.useLoaderData();
  const { items, removeItem } = useInterest();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  function send() {
    if (!name.trim() || items.length === 0) {
      setError("Informe seu nome e adicione pelo menos um produto.");
      return;
    }
    if (!settings.whatsapp_number) {
      setError("O WhatsApp da confeitaria ainda não foi configurado.");
      return;
    }
    const products = items
      .map(
        (item, index) =>
          `${index + 1}. ${item.productName} — ${item.quantity} unidade(s)${item.variationName ? ` — ${item.variationName}` : ""}${item.desiredDate ? ` — data: ${item.desiredDate}` : ""}${item.notes ? ` — observações: ${item.notes}` : ""}`,
      )
      .join("\n");
    const message = `Olá! Tudo bem? 💗\n\nVi o catálogo da Estrela Gourmet e gostaria de consultar uma encomenda.\n\nNome: ${name.trim()}\n\nProdutos:\n${products}\n\nData desejada: ${date || "A combinar"}\n\nObservações: ${notes.trim() || "Nenhuma"}\n\nVocês conseguem preparar para essa data? Poderiam confirmar a disponibilidade e o valor?`;
    window.open(
      `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }
  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <main className="mx-auto max-w-3xl">
        <div className="grid grid-cols-[auto_1fr] items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft />
            </Link>
          </Button>
          <div>
            <p className="font-script text-3xl">Estrela Gourmet</p>
            <h1 className="font-display text-3xl font-semibold">Sua lista de interesse</h1>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Esta lista gera apenas uma consulta. A encomenda será confirmada pela confeiteira no
          WhatsApp.
        </p>
        <div className="mt-7 grid gap-3">
          {items.length === 0 ? (
            <div className="border-y border-border py-14 text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-primary/50" />
              <p className="mt-3 font-display text-xl">Sua lista está vazia</p>
              <Button asChild className="mt-4">
                <Link to="/">Ver cardápio</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <article
                key={item.key}
                className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-card p-3"
              >
                <div className="h-16 w-16 overflow-hidden rounded-md bg-secondary">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-display text-lg font-semibold">
                    {item.productName}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} unidade(s){item.variationName ? ` • ${item.variationName}` : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.key)}
                  aria-label={`Remover ${item.productName}`}
                >
                  <Trash2 />
                </Button>
              </article>
            ))
          )}
        </div>
        {items.length > 0 && (
          <section className="mt-8 grid gap-4 border-t border-border pt-7">
            <div>
              <label htmlFor="customer" className="mb-2 block text-sm font-semibold">
                Seu nome *
              </label>
              <Input
                id="customer"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="general-date" className="mb-2 block text-sm font-semibold">
                Data desejada
              </label>
              <Input
                id="general-date"
                type="date"
                value={date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="general-notes" className="mb-2 block text-sm font-semibold">
                Observações gerais
              </label>
              <Textarea
                id="general-notes"
                value={notes}
                maxLength={1000}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button variant="elegant" size="lg" onClick={send}>
              <MessageCircle /> Enviar consulta pelo WhatsApp
            </Button>
          </section>
        )}
      </main>
    </div>
  );
}
