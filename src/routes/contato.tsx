import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Instagram, MessageCircle } from "lucide-react";
import { getCatalog } from "@/lib/catalog.functions";

export const Route = createFileRoute("/contato")({
  loader: () => getCatalog(),
  head: () => ({
    meta: [
      { title: "Contato — Estela Gourmet" },
      { name: "description", content: "Fale com a Estela Gourmet para consultar sua encomenda." },
      { property: "og:title", content: "Contato — Estela Gourmet" },
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
    <div className="eg-site">
      <div className="eg-page">
        <header className="eg-header eg-header-detail">
          <div className="eg-brand">
            <span className="eg-brand-name">Estela Gourmet</span>
          </div>
          <div className="eg-header-actions">
            <Link to="/" className="eg-icon-button" aria-label="Voltar ao catálogo">
              <ArrowLeft size={21} />
            </Link>
          </div>
        </header>
        <main className="eg-detail">
          <div style={{ maxWidth: 540, margin: "0 auto", padding: "20px 0" }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px,5vw,42px)", color: "#794a40", marginBottom: 8 }}>Contato</h1>
            <p style={{ color: "#6d4b43", lineHeight: 1.6, marginBottom: 24 }}>
              {settings.contact_info ||
                "As informações oficiais de contato serão exibidas assim que forem cadastradas."}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {settings.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number}`}
                  target="_blank"
                  rel="noreferrer"
                  className="eg-detail-cta"
                  style={{ textDecoration: "none" }}
                >
                  <MessageCircle size={20} /> WhatsApp
                </a>
              )}
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="eg-detail-cta"
                  style={{ textDecoration: "none", background: "#c07880" }}
                >
                  <Instagram size={20} /> Instagram
                </a>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
