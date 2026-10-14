import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Home, MessageCircle, Search, Heart } from "lucide-react";
import { getCatalog } from "@/lib/catalog.functions";
import { useInterest } from "@/lib/interest-context";
import { toast } from "sonner";
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

function HomePage() {
  const data = Route.useLoaderData();
  const { addItem, items } = useInterest();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const buscaRef = useRef<HTMLInputElement>(null);

  const settings = data.settings;
  const digits = (settings?.whatsapp_number ?? "").replace(/\D/g, "");
  const whatsapp = `https://wa.me/${digits}`;
  const whatsappGeral = `${whatsapp}?text=${encodeURIComponent(MENSAGEM_GERAL)}`;
  const bannerImage =
    settings?.hero_images?.[0] ?? "/assets/01-home/hero-principal-brigadeiros-caramelo-florais.jpg";

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

  function adicionarAosInteresses(produto: (typeof data.products)[number]) {
    addItem({
      productId: produto.id,
      productName: produto.name,
      quantity: 1,
      variationId: null,
      variationName: null,
      desiredDate: "",
      notes: "",
      imageUrl: produto.product_images[0]?.image_url ?? null,
    });
    toast.success(`${produto.name} foi adicionado à sua lista ♡`);
  }

  return (
    <div className="estrela-home">
      <div className="loja">
        <header className="topo">
          <Link className="logo-eg" to="/" aria-label="Estrela Gourmet">
            EG
          </Link>
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
              Pequenos detalhes,
              <em>grandes momentos</em>
            </h1>
            <p>Brigadeiros que tornam a vida mais doce.</p>
            <a className="btn-encomenda" href={whatsappGeral} target="_blank" rel="noreferrer">
              <Heart size={18} /> FAÇA SUA ENCOMENDA
            </a>
          </div>
          <div className="hero-foto">
            <img src={bannerImage} alt="Brigadeiros gourmet da Estrela Gourmet" />
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
                  <button
                    className="btn-interesse"
                    type="button"
                    onClick={() => adicionarAosInteresses(produto)}
                  >
                    Tenho interesse
                  </button>
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
        </footer>
      </div>

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
