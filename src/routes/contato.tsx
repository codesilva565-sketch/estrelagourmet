import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCatalog } from "@/lib/catalog.functions";

export const Route = createFileRoute("/contato")({
  loader: () => getCatalog(),
  head: () => ({
    meta: [
      { title: "Contato — Estrela Gourmet" },
      { name: "description", content: "Fale com a Estrela Gourmet para consultar sua encomenda." },
      { property: "og:title", content: "Contato — Estrela Gourmet" },
      { property: "og:description", content: "Consulte doces e encomendas pelo WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});
function Contact() {
  const { settings } = Route.useLoaderData();
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <Button variant="ghost" size="icon" asChild>
        <Link to="/">
          <ArrowLeft />
        </Link>
      </Button>
      <p className="mt-14 font-script text-4xl text-primary">Estrela Gourmet</p>
      <h1 className="font-display text-5xl font-semibold">Contato</h1>
      <p className="mt-5 text-muted-foreground">
        {settings.contact_info ||
          "As informações oficiais de contato serão exibidas assim que forem cadastradas."}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {settings.whatsapp_number && (
          <Button variant="elegant" asChild>
            <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noreferrer">
              <MessageCircle /> WhatsApp
            </a>
          </Button>
        )}
        {settings.instagram_url && (
          <Button variant="outline" asChild>
            <a href={settings.instagram_url} target="_blank" rel="noreferrer">
              <Instagram /> Instagram
            </a>
          </Button>
        )}
      </div>
    </main>
  );
}
