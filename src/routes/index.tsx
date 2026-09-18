import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CakeSlice,
  ChevronRight,
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

const HERO = "/assets/01-home/hero-principal-brigadeiros-caramelo-florais.jpg";

const fallbackIcons = [CakeSlice, Sparkles, Gift, Heart, CakeSlice];

const categoryNames = [
  "Brigadeiros",
  "Personalizados",
  "Caixas",
  "Presentes",
  "Ocasiões",
] as const;

function CategoryIcon({ index }: { index: number }) {
  const Icon = fallbackIcons[index] ?? CakeSlice;
  return <Icon size={27} strokeWidth={1.4} />;
}

export const Route = createFileRoute("/")({
  loader: () => getCatalog(),
  head: () => ({
    meta: [
      { title: "Estrela Gourmet — Brigadeiros em Vicentina" },
      {
        name: "description",
        content:
          "Conheça o catálogo de brigadeiros gourmet e envie sua consulta de encomenda pelo WhatsApp.",
      },
      { property: "og:title", content: "Estrela Gourmet — Brigadeiros em Vicentina" },
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
    () => data.products.filter((p) => p.is_featured && p.is_available).slice(0, 3),
    [data],
  );
  const list =
    categoryFilter || query || showAll
      ? visible
      : featured.length
        ? featured
        : visible.slice(0, 3);

  const settings = data.settings;

  return (
    <div className="eg-site">
      <div className="eg-page">
        <SiteHeader logoUrl={settings.logo_url} variant="home" />

        <main>
          {/* Hero — Grid 42% texto | 58% foto */}
          <section className="eg-hero" aria-label="Apresentação Estrela Gourmet">
            <div className="eg-hero-copy">
              <h1>
                Pequenos<br />
                detalhes,<br />
                <em>grandes</em><br />
                <em>momentos</em>
                <span className="eg-hand-heart">♡</span>
              </h1>
              <p>
                BRIGADEIROS QUE<br />
                TORNAM A VIDA<br />
                MAIS DOCE!
              </p>
              <button
                className="eg-hero-cta"
                onClick={() =>
                  document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <MessageCircle size={20} strokeWidth={1.8} /> FAÇA SUA ENCOMENDA <ArrowRight size={18} />
              </button>
            </div>
            <div className="eg-hero-image" aria-hidden="true">
              <img src={HERO} alt="" className="h-full w-full object-cover" />
              <p className="eg-hero-handwritten">
                Sabor<br />que cria<br />boas<br />histórias ♡
              </p>
            </div>
          </section>

          {/* Categories */}
          <section className="eg-categories" aria-label="Categorias">
            {data.categories.map((cat, index) => (
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
                <span className="eg-category-circle">
                  <CategoryIcon index={index} />
                </span>
                <span>{cat.name}</span>
              </button>
            ))}
          </section>

          {/* Search */}
          <section className="eg-search-area" aria-label="Pesquisar e filtrar produtos">
            <label className="eg-search">
              <Search size={20} strokeWidth={1.6} />
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
              <SlidersHorizontal size={22} strokeWidth={1.6} />
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
                {showAll ? "Ver destaques" : "Ver todos"} <ArrowRight size={15} />
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
              <CakeSlice size={22} />
              <span>
                Qualidade
                <br />
                artesanal
              </span>
            </div>
            <div>
              <Sparkles size={22} />
              <span>
                Feito com
                <br />
                carinho
              </span>
            </div>
            <div>
              <MessageCircle size={22} />
              <span>
                Atendimento
                <br />
                pelo WhatsApp
              </span>
            </div>
            <div>
              <Heart size={22} />
              <span>
                Doces que
                <br />
                conectam
              </span>
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
