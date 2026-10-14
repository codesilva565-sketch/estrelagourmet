import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Home, MessageCircle, Search, Heart } from "lucide-react";
import { getCatalog } from "@/lib/catalog.functions";
import { readDemoOverrides, type DemoOverrides } from "@/lib/demo-store";
import { useInterest } from "@/lib/interest-context";
import "@/styles/estrela-home.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estrela Gourmet — Brigadeiros Gourmet em Vicentina/MS" },
      {
        name: "description",
        content:
          "Brigadeiros gourmet feitos com amor em Vicentina/MS. Caixas, personalizados e presentes para tornar seus momentos mais doces.",
      },
      { property: "og:title", content: "Estrela Gourmet — Brigadeiros Gourmet" },
      {
        property: "og:description",
        content: "Feitos com amor em Vicentina/MS. Mais que doces, criamos momentos especiais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: () => getCatalog(),
  component: HomePage,
});

const MENSAGEM_GERAL =
  "Olá! Tenho interesse em brigadeiros gourmet. Poderia me passar mais informações, por favor?";

const BANNER_PADRAO = "/assets/01-home/hero-principal-brigadeiros-caramelo-florais.jpg";
const INTERVALO_CARROSSEL = 5000;

function HomePage() {
  const data = Route.useLoaderData();
  const { items } = useInterest();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [slide, setSlide] = useState(0);
  const [demo, setDemo] = useState<DemoOverrides>({});
  const buscaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDemo(readDemoOverrides());
  }, []);

  const settings = data.settings;
  const digits = (demo.whatsapp_number ?? settings?.whatsapp_number ?? "").replace(/\D/g, "");
  const whatsapp = `https://wa.me/${digits}`;
  const whatsappGeral = `${whatsapp}?text=${encodeURIComponent(MENSAGEM_GERAL)}`;
  const logoUrl = demo.logo_url ?? settings?.logo_url ?? null;

  const heroImages = useMemo(() => {
    const lista = (demo.hero_images?.length ? demo.hero_images : settings?.hero_images) ?? [];
    const validas = lista.filter((imagem): imagem is string => Boolean(imagem));
    return validas.length > 0 ? validas : [BANNER_PADRAO];
  }, [demo.hero_images, settings?.hero_images]);

  useEffect(() => {
    setSlide(0);
  }, [heroImages]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const id = window.setInterval(
      () => setSlide((atual) => (atual + 1) % heroImages.length),
      INTERVALO_CARROSSEL,
    );
    return () => window.clearInterval(id);
  }, [heroImages.length]);

  const heroTitle =
    (demo.hero_title ?? settings?.hero_title ?? "").trim() || "Pequenos detalhes, grandes momentos";
  const heroSubtitle =
    (demo.hero_subtitle ?? settings?.hero_subtitle ?? "").trim() ||
    "Brigadeiros que tornam a vida mais doce.";
  const heroSeparador = heroTitle.indexOf(",");
  const heroTituloInicio = heroSeparador >= 0 ? heroTitle.slice(0, heroSeparador + 1) : heroTitle;
  const heroTituloDestaque = heroSeparador >= 0 ? heroTitle.slice(heroSeparador + 1).trim() : "";

  const nomeCategoria = (categoriaId: string | null) =>
    data.categories.find((c) => c.id === categoriaId)?.name ?? "";

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return data.products
      .filter((p) => p.is_available)
      .filter((produto) => {
        const nome = data.categories.find((c) => c.id === produto.category_id)?.name ?? "";
        const correspondeBusca =
          !termo ||
          `${produto.name} ${produto.short_description} ${produto.description} ${nome}`
            .toLowerCase()
            .includes(termo);
        const correspondeCategoria = !categoria || nome === categoria;
        return correspondeBusca && correspondeCategoria;
      })
      .sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  }, [busca, categoria, data]);

  return (
    <div className="estrela-home">
      <div className="faixa-topo">
        <span>✨ Brigadeiros artesanais · encomendas para festas e presentes ✨</span>
      </div>
      <div className="loja">
        <header className="topo">
          {logoUrl ? (
            <img className="logo-eg-img" src={logoUrl} alt="Estrela Gourmet" />
          ) : (
            <Link className="logo-eg" to="/" aria-label="Estrela Gourmet">
              EG
            </Link>
          )}
          <div className="topo-marca">
            <strong>Estrela Gourmet</strong>
            <span>BRIGADEIROS GOURMET</span>
          </div>
          <button
            className="hamburguer"
            type="button"
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
            onClick={() => setMenuAberto((v) => !v)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>

          {menuAberto && (
            <nav className="menu-mobile">
              <a href="#inicio" onClick={() => setMenuAberto(false)}>
                Início
              </a>
              <a href="#mais-pedidos" onClick={() => setMenuAberto(false)}>
                Mais pedidos
              </a>
              <Link to="/interesse" onClick={() => setMenuAberto(false)}>
                Minha lista {items.length > 0 && <span>({items.length})</span>}
              </Link>
              <a href={whatsappGeral} target="_blank" rel="noreferrer">
                Falar no WhatsApp
              </a>
              <Link to="/admin" onClick={() => setMenuAberto(false)}>
                Área da proprietária
              </Link>
            </nav>
          )}
        </header>

        <section className="hero" id="inicio">
          <div className="hero-texto">
            <span className="sobretitulo">FEITOS COM AMOR EM VICENTINA/MS</span>
            <h1>
              {heroTituloInicio}
              {heroTituloDestaque && <em>{heroTituloDestaque}</em>}
            </h1>
            <p>{heroSubtitle}</p>
            <a className="btn-encomenda" href={whatsappGeral} target="_blank" rel="noreferrer">
              <Heart size={18} /> FAÇA SUA ENCOMENDA
            </a>
          </div>
          <div className="hero-foto">
            <img
              key={heroImages[slide]}
              src={heroImages[slide]}
              alt="Brigadeiros gourmet da Estrela Gourmet"
            />
            {heroImages.length > 1 && (
              <div className="hero-dots" role="tablist" aria-label="Fotos de capa">
                {heroImages.map((imagem, index) => (
                  <button
                    key={`${imagem}-${index}`}
                    type="button"
                    className={index === slide ? "active" : ""}
                    aria-label={`Ver imagem ${index + 1}`}
                    aria-selected={index === slide}
                    onClick={() => setSlide(index)}
                  />
                ))}
              </div>
            )}
            <span className="selo">
              Feito com amor
              <br />
              em cada detalhe
            </span>
          </div>
        </section>

        <nav className="cats" aria-label="Categorias">
          {data.categories.map((item) => (
            <button
              className={`cat ${categoria === item.name ? "cat-ativa" : ""}`}
              key={item.id}
              type="button"
              aria-pressed={categoria === item.name}
              onClick={() => setCategoria(categoria === item.name ? null : item.name)}
            >
              <span className="cat-icone">{item.icon || "🍫"}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <label className="busca">
          <Search size={18} />
          <input
            ref={buscaRef}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Busque por produtos, sabores ou ocasiões"
            aria-label="Buscar produtos"
          />
        </label>

        <section id="mais-pedidos">
          <div className="titulo-secao">
            <h2>
              Mais pedidos <span>♡</span>
            </h2>
            <Link to="/interesse">Ver minha lista</Link>
          </div>

          <div className="produtos">
            {filtrados.map((produto) => (
              <article className="produto" key={produto.id}>
                <Link className="produto-foto" to="/produto/$slug" params={{ slug: produto.slug }}>
                  <img
                    src={produto.product_images[0]?.image_url}
                    alt={produto.name}
                    loading="lazy"
                  />
                  {produto.is_featured && <span className="produto-selo">Mais pedido</span>}
                  <span className="produto-coracao">♡</span>
                </Link>
                <div className="produto-info">
                  <span className="produto-categoria">{nomeCategoria(produto.category_id)}</span>
                  <h3>
                    <Link to="/produto/$slug" params={{ slug: produto.slug }}>
                      {produto.name}
                    </Link>
                  </h3>
                  <span className="produto-preco">
                    {produto.price && produto.price > 0
                      ? produto.price.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : "Sob consulta"}
                  </span>
                  <Link
                    className="btn-interesse"
                    to="/produto/$slug"
                    params={{ slug: produto.slug }}
                  >
                    Tenho interesse
                  </Link>
                </div>
              </article>
            ))}

            {filtrados.length === 0 && (
              <p className="sem-produtos">Não encontramos produtos para essa busca. ♡</p>
            )}
          </div>
        </section>

        <section className="diferenciais">
          <div>
            <span>♡</span>
            <p>Qualidade artesanal</p>
          </div>
          <div>
            <span>✿</span>
            <p>Feito com carinho</p>
          </div>
          <div>
            <span>✆</span>
            <p>Atendimento no WhatsApp</p>
          </div>
          <div>
            <span>🎁</span>
            <p>Presentes especiais</p>
          </div>
        </section>

        <footer className="rodape">
          <span className="rodape-marca">Estrela Gourmet ♡</span>
          <p>Mais que doces, criamos momentos especiais.</p>
          <span className="rodape-sub">
            Feitos com amor em Vicentina/MS — <Link to="/interesse">Minha lista</Link> ·{" "}
            <Link to="/admin">Área da proprietária</Link>
          </span>
          <span className="rodape-credit">Criado por <a href="https://vicsolves.site" target="_blank" rel="noreferrer">Vic Solves</a></span>
        </footer>
      </div>

      <a
        className="zap-flutuante"
        href={whatsappGeral}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar no WhatsApp"
      >
        <MessageCircle size={26} />
      </a>

      <nav className="rodape-fixo" aria-label="Navegação rápida">
        <a href="#inicio" className="ativo">
          <span className="rodape-icone">
            <Home size={21} />
          </span>
          Início
        </a>
        <button type="button" onClick={() => buscaRef.current?.focus()}>
          <span className="rodape-icone">
            <Search size={21} />
          </span>
          Buscar
        </button>
        <Link to="/interesse">
          <span className="rodape-icone">
            <Heart size={21} />
            {items.length > 0 && <span className="rodape-contador">{items.length}</span>}
          </span>
          Lista
        </Link>
        <a href={whatsappGeral} target="_blank" rel="noreferrer">
          <span className="rodape-icone">
            <MessageCircle size={21} />
          </span>
          WhatsApp
        </a>
      </nav>
    </div>
  );
}
