import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Gift,
  Heart,
  MessageCircle,
  Package,
  ShoppingBag,
} from "lucide-react";
import { getProduct, getCatalog } from "@/lib/catalog.functions";
import { useInterest } from "@/lib/interest-context";
import type { Product } from "@/lib/catalog.types";
import { EncomendaModal } from "@/components/encomenda-modal";
import "@/styles/estrela-produto.css";

function formatBRL(value: number | null) {
  return value == null
    ? "Sob consulta"
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export const Route = createFileRoute("/produto/$slug")({
  loader: async ({ params }) => {
    const [product, catalog] = await Promise.all([
      getProduct({ data: { slug: params.slug } }),
      getCatalog(),
    ]);
    return { product, settings: catalog.settings };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData.product
          ? `${loaderData.product.name} — Estrela Gourmet`
          : "Produto — Estrela Gourmet",
      },
      {
        name: "description",
        content:
          loaderData.product?.short_description || "Detalhes do produto artesanal Estrela Gourmet.",
      },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { product, settings } = Route.useLoaderData();
  if (!product) return null;
  return <ProductDetail product={product} settings={settings} />;
}

function ProductDetail({
  product,
  settings,
}: {
  product: Product;
  settings?: { whatsapp_number?: string };
}) {
  const { items } = useInterest();
  const [fotoIndex, setFotoIndex] = useState(0);
  const [opcao, setOpcao] = useState(0);
  const [quantidade, setQuantidade] = useState(1);
  const [encomendaAberta, setEncomendaAberta] = useState(false);

  const imagens = product.product_images ?? [];
  const variacoes = product.product_variations ?? [];
  const fotoAtual = imagens[fotoIndex];
  const variacao = variacoes[opcao] ?? null;
  const precoAtual = variacao ? variacao.price : product.price;

  return (
    <div className="estrela-produto">
      <header className="top-bar">
        <Link className="icone-redondo" to="/" aria-label="Voltar para a loja">
          <ChevronLeft size={22} />
        </Link>
        <Link className="logo" to="/">
          Estrela Gourmet
        </Link>
        <Link className="carrinho" to="/interesse" aria-label="Minha lista de interesse">
          <ShoppingBag size={21} />
          {items.length > 0 && <span className="badge">{items.length}</span>}
        </Link>
      </header>

      <div className="product-wrapper">
        <div className="img-box">
          {fotoAtual?.image_url ? (
            <img src={fotoAtual.image_url} alt={fotoAtual.alt_text || product.name} />
          ) : (
            <div className="sem-foto">
              <Package size={56} />
            </div>
          )}

          {imagens.length > 1 && (
            <>
              <button
                className="gallery-nav prev"
                type="button"
                aria-label="Foto anterior"
                onClick={() => setFotoIndex((i) => (i + imagens.length - 1) % imagens.length)}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="gallery-nav next"
                type="button"
                aria-label="Próxima foto"
                onClick={() => setFotoIndex((i) => (i + 1) % imagens.length)}
              >
                <ChevronRight size={20} />
              </button>
              <div className="gallery-dots">
                {imagens.map((foto, i) => (
                  <button
                    key={foto.id}
                    type="button"
                    className={fotoIndex === i ? "active" : ""}
                    aria-label={`Ver foto ${i + 1}`}
                    aria-pressed={fotoIndex === i}
                    onClick={() => setFotoIndex(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="info">
          <h1>{product.name}</h1>
          <div className="price">{formatBRL(precoAtual)}</div>
          <p className="desc">{product.description || product.short_description}</p>

          <div className="icons">
            <span>
              <Package size={22} /> Artesanal
            </span>
            <span>
              <Gift size={22} /> Para presentear
            </span>
            <span>
              <Heart size={22} /> Feito com amor
            </span>
          </div>

          {variacoes.length > 0 && (
            <>
              <div className="secao-label">Selecione uma opção:</div>
              <div className="options">
                {variacoes.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`opt ${opcao === index ? "active" : ""}`}
                    aria-pressed={opcao === index}
                    onClick={() => setOpcao(index)}
                  >
                    <b>{item.name}</b>
                    <span>{formatBRL(item.price)}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="qty-row">
            <span>Quantidade</span>
            <div className="qty-ctrl">
              <button
                className="qty-btn"
                type="button"
                aria-label="Diminuir quantidade"
                disabled={quantidade <= 1}
                onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <strong>{quantidade}</strong>
              <button
                className="qty-btn"
                type="button"
                aria-label="Aumentar quantidade"
                disabled={quantidade >= 99}
                onClick={() => setQuantidade((q) => Math.min(99, q + 1))}
              >
                +
              </button>
            </div>
          </div>

          <button
            className="btn btn-green"
            type="button"
            disabled={!product.is_available}
            onClick={() => setEncomendaAberta(true)}
          >
            <MessageCircle size={20} /> Fazer pedido agora
          </button>

          <p className="disclaimer">
            Consulta sem compromisso. A disponibilidade e o valor serão confirmados pela
            confeiteira.
          </p>
        </div>
      </div>

      {encomendaAberta && (
        <EncomendaModal
          product={product}
          variation={variacao}
          quantity={quantidade}
          whatsappNumber={settings?.whatsapp_number ?? ""}
          onClose={() => setEncomendaAberta(false)}
        />
      )}
    </div>
  );
}
