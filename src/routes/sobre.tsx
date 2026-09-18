import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart } from "lucide-react";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre nós — Estrela Gourmet" },
      {
        name: "description",
        content: "Conheça a Estrela Gourmet, confeitaria artesanal de Vicentina, MS.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="eg-site">
      <div className="eg-page">
        <header className="eg-header eg-header-detail">
          <div className="eg-brand">
            <span className="eg-brand-name">Estrela Gourmet</span>
          </div>
          <div className="eg-header-actions">
            <Link to="/" className="eg-icon-button" aria-label="Voltar ao catálogo">
              <ArrowLeft size={21} />
            </Link>
          </div>
        </header>
        <main className="eg-detail">
          <div style={{ maxWidth: 540, margin: "0 auto", padding: "20px 0" }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px,5vw,42px)", color: "#794a40", marginBottom: 8 }}>Sobre nós</h1>
            <div style={{ borderTop: "1px solid #e7ceca", borderBottom: "1px solid #e7ceca", padding: "32px 0", marginTop: 16 }}>
              <Heart size={28} color="#c87779" />
              <p style={{ marginTop: 16, fontSize: 17, lineHeight: 1.7, color: "#6d4b43" }}>
                A história oficial da confeitaria será apresentada aqui com as palavras e fotografias
                reais da proprietária.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
