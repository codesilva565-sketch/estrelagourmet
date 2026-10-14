import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CakeSlice,
  Gift,
  Heart,
  MessageCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { ProductCard } from "@/components/catalog/product-card";
import { SiteHeader } from "@/components/catalog/site-header";
import { getCatalog } from "@/lib/catalog.functions";

const CATEGORY_PHOTOS: Record<string, string> = {};

function resolveCategoryPhoto(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.includes("brigadeiro")) return "/assets/02-brigadeiros/brigadeiro-chocolate-close.jpg";
  if (lower.includes("personalizado")) return "/assets/03-personalizados/alice-personagem-close.jpg";
  if (lower.includes("caixa")) return "/assets/04-caixas/caixa-brigadeiros-sortidos.jpg";
  if (lower.includes("presente")) return "/assets/03-personalizados/estrela-dourada-close.jpg";
  if (lower.includes("ocasi")) return "/assets/03-personalizados/angel-close-rosa.jpg";
  return null;
}

export const Route = createFileRoute("/")({
  loader: () => getCatalog(),
  head: () => ({
    meta: [
      { title: "Estela Gourmet — Brigadeiros em Vicentina" },
      {
        name: "description",
        content:
          "Conheça o catálogo de brigadeiros gourmet e envie sua consulta de encomenda pelo WhatsApp.",
      },
      { property: "og:title", content: "Estela Gourmet — Brigadeiros em Vicentina" },
      {
        property: "og:description",
        content: "Doces artesanais para tornar seus momentos ainda mais especiais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HeroCarousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    timerRef.current = setInterval(advance, 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [advance]);

  return (
    <div className="eg-hero-image" aria-hidden="true">
      <div
        className="eg-hero-carousel"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((src, i) => (
          <div className="eg-hero-slide" key={i}>
            <img src={src} alt="" loading={i === 0 ? "eager" : "lazy"} />
          </div>
        ))}
      </div>
      <div className="eg-hero-dots">
        {images.map((_, i) => (
          <button
            key={i}
            className={`eg-hero-dot ${i === current ? "eg-active" : ""}`}
            onClick={() => setCurrent(i)}
            aria-label={`Imagem ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  const data = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    return data.products.filter((product) => {
      if (!product.is_available) return false;
      if (categoryFilter && product.category_id !== categoryFilter) return false;
      const categoryName =
        data.categories.find((c) => c.id === product.category_id)?.name ?? "";
      const haystack =
        `${product.name} ${product.short_description} ${product.description} ${categoryName}`.toLocaleLowerCase("pt-BR");
      return !term || haystack.includes(term);
    });
  }, [categoryFilter, data, query]);

  const featured = useMemo(
    () => data.products.filter((p) => p.is_featured && p.is_available).slice(0, 6),
    [data],
  );
  const list =
    categoryFilter || query || showAll
      ? visible
      : featured.length
        ? featured
        : visible.slice(0, 6);

  const settings = data.settings;
  const heroImages = (settings?.hero_images && settings.hero_images.length > 0)
    ? settings.hero_images
    : ["/assets/02-brigadeiros/brigadeiro-chocolate-close.jpg", "/assets/03-personalizados/alice-personagem-close.jpg", "/assets/03-personalizados/angel-close-rosa.jpg", "/assets/03-personalizados/alice-chave-dourada-close.jpg", "/assets/04-caixas/caixa-brigadeiros-sortidos.jpg"];

  return (
    <div className="eg-site">
      <div className="eg-page">
        <SiteHeader logoUrl={settings.logo_url} variant="home" />

        <main>
          {/* Carrossel — diretamente abaixo do header */}
          <section className="eg-hero" aria-label="Fotografias principais">
            <HeroCarousel images={heroImages} />
          </section>

          {/* Seção de apresentação e encomenda */}
          <section className="eg-presentation" aria-label="Apresentação">
            <div className="eg-presentation-content">
              <h1>
                Pequenos detalhes,
                <br />
                <em>grandes</em> <em>momentos</em>
              </h1>
              <p>BRIGADEIROS QUE TORNAM A VIDA MAIS DOCE!</p>
              <button
                className="eg-hero-cta"
                onClick={() =>
                  document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                FAÇA SUA ENCOMENDA <ArrowRight size={16} />
              </button>
            </div>
          </section>

          {/* Categorias */}
          <section className="eg-categories" aria-label="Categorias">
            {data.categories.map((cat) => {
              const photo = CATEGORY_PHOTOS[cat.id] ?? resolveCategoryPhoto(cat.name);
              return (
                <button
                  className={`eg-category ${categoryFilter === cat.id ? "eg-active" : ""}`}
                  key={cat.id}
                  onClick={() => {
                    setCategoryFilter(categoryFilter === cat.id ? null : cat.id);
                    setShowAll(true);
                    setQuery("");
                    requestAnimationFrame(() =>
                      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" }),
                    );
                  }}
                  aria-pressed={categoryFilter === cat.id}
                >
                  {photo ? (
                    <img className="eg-category-img" src={photo} alt={cat.name} />
                  ) : (
                    <span className="eg-category-img" style={{ display: "grid", placeItems: "center", background: "#FBE8E7" }}>
                      <CakeSlice size={20} strokeWidth={1.4} />
                    </span>
                  )}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </section>

          {/* Search */}
          <section className="eg-search-area" aria-label="Pesquisar e filtrar produtos" style={{ position: "relative" }}>
            <label className="eg-search">
              <Search size={18} strokeWidth={1.6} />
              <input
                aria-label="Pesquisar produtos"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setShowAll(true);
                }}
                placeholder="Busque por produtos, sabores ou ocasiões..."
              />
            </label>
            <button
              className={`eg-filter-button ${filtersOpen ? "eg-active" : ""}`}
              aria-label="Mostrar filtros"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <SlidersHorizontal size={20} strokeWidth={1.6} />
            </button>
            {filtersOpen && (
              <div className="eg-filter-drawer">
                <button
                  onClick={() => {
                    setCategoryFilter(null);
                    setQuery("");
                    setShowAll(true);
                    setFiltersOpen(false);
                  }}
                >
                  Todos os produtos
                </button>
                {data.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategoryFilter(cat.id);
                      setShowAll(true);
                      setFiltersOpen(false);
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Products */}
          <section className="eg-products" id="catalogo">
            <div className="eg-section-heading">
              <h2>
                {categoryFilter
                  ? data.categories.find((c) => c.id === categoryFilter)?.name
                  : query
                    ? "Resultados"
                    : showAll
                      ? "Nosso cardápio"
                      : "Mais pedidos"}{" "}
                <span>♥</span>
              </h2>
              <button
                onClick={() => {
                  setCategoryFilter(null);
                  setQuery("");
                  setShowAll(!showAll);
                }}
              >
                {showAll ? "Ver destaques" : "Ver todos"} <ArrowRight size={14} />
              </button>
            </div>
            <div className="eg-product-grid">
              {list.length ? (
                list.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="eg-empty">
                  Nenhum produto encontrado. Experimente outra categoria ou termo.
                </div>
              )}
            </div>
          </section>

          {/* Benefits */}
          <section id="sobre" className="eg-benefits" aria-label="Nossa proposta">
            <div>
              <CakeSlice size={20} />
              <span>Qualidade<br />artesanal</span>
            </div>
            <div>
              <Sparkles size={20} />
              <span>Feito com<br />carinho</span>
            </div>
            <div>
              <MessageCircle size={20} />
              <span>Atendimento<br />pelo WhatsApp</span>
            </div>
            <div>
              <Heart size={20} />
              <span>Doces que<br />conectam</span>
            </div>
          </section>
          <p className="eg-signoff">
            "Mais que doces, criamos momentos especiais." <span>♥</span>
          </p>
        </main>
      </div>
    </div>
  );
}
