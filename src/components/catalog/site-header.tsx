import { Link } from "@tanstack/react-router";
import { Heart, Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useInterest } from "@/lib/interest-context";

export function SiteHeader({
  logoUrl,
  variant = "home",
}: {
  logoUrl?: string | null;
  variant?: "home" | "detail";
}) {
  const { items } = useInterest();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className={`eg-header ${variant === "detail" ? "eg-header-detail" : ""}`}>
        <Link to="/" className="eg-logo-button" aria-label="Voltar ao início">
          {logoUrl ? (
            <img className="eg-logo" src={logoUrl} alt="Logotipo oficial Estrela Gourmet" />
          ) : (
            <span className="grid h-full place-items-center font-script text-lg text-primary">
              EG
            </span>
          )}
        </Link>

        <div className="eg-brand" aria-label="Estrela Gourmet — Brigadeiros Gourmet">
          <span className="eg-brand-name">
            Estrela Gourmet<span className="eg-brand-heart">♡</span>
          </span>
          <span className="eg-brand-subtitle">BRIGADEIROS GOURMET</span>
          <span className="eg-brand-rule">
            <i />
            ♡
            <i />
          </span>
          <span className="eg-brand-local">
            Feitos com amor em
            <br />
            Vicentina/MS
          </span>
        </div>

        <div className="eg-header-actions">
          <button className="eg-icon-button eg-header-heart" title="Meus favoritos" aria-label="Favoritos">
            <Heart size={22} />
          </button>
          <Link to="/interesse" className="eg-icon-button eg-bag" title="Lista de interesse" aria-label={`Lista de interesse, ${items.length} itens`}>
            <ShoppingBag size={22} />
            {items.length > 0 && <span className="eg-bag-count">{items.length}</span>}
          </Link>
          <button
            className="eg-icon-button eg-menu-button"
            title="Abrir menu"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav className="eg-menu" aria-label="Menu principal">
          <Link to="/" onClick={() => setMenuOpen(false)}>Início</Link>
          <Link to="/#catalogo" onClick={() => setMenuOpen(false)}>Cardápio</Link>
          <Link to="/" onClick={() => setMenuOpen(false)}>Personalizados</Link>
          <Link to="/sobre" onClick={() => setMenuOpen(false)}>Sobre nós</Link>
          <Link to="/contato" onClick={() => setMenuOpen(false)}>Contato / encomendar</Link>
          <Link to="/admin" onClick={() => setMenuOpen(false)}>Área da proprietária</Link>
        </nav>
      )}
    </>
  );
}
