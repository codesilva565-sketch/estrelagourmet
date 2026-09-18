import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CakeSlice,
  ChevronLeft,
  ChevronRight,
  Gift,
  Heart,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { getProduct, getCatalog } from "@/lib/catalog.functions";
import { useInterest } from "@/lib/interest-context";
import type { Product } from "@/lib/catalog.types";
import { toast } from "sonner";

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
      { title: loaderData.product ? `${loaderData.product.name} — Estrela Gourmet` : "Produto — Estrela Gourmet" },
      {
        name: "description",
        content: loaderData.product?.short_description || "Detalhes do produto artesanal Estrela Gourmet.",
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

function ProductDetail({ product, settings }: { product: Product; settings?: { whatsapp_number?: string } }) {
  const { addItem, items } = useInterest();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [variantId, setVariantId] = useState(
    product.product_variations.find((v) => v.is_available)?.id ?? "",
  );
  const [quantity, setQuantity] = useState(1);

  const selectedVariation = product.product_variations.find((v) => v.id === variantId) ?? null;
  const images = product.product_images;
  const currentImage = images[photoIndex];

  function addToInterest() {
    if (!product.is_available) return;
    addItem({
      productId: product.id,
      productName: product.name,
      quantity,
      variationId: selectedVariation?.id ?? null,
      variationName: selectedVariation?.name ?? null,
      desiredDate: "",
      notes: "",
      imageUrl: images[0]?.image_url ?? null,
    });
    toast.success("Produto adicionado à lista de interesse.");
  }

  function openWhatsApp() {
    const whatsapp = settings?.whatsapp_number || "5567999438984";
    const variationText = selectedVariation ? ` (${selectedVariation.name})` : "";
    const msg = `Olá! Tudo bem? 💗\n\nTenho interesse no produto: *${product.name}${variationText}*\nQuantidade: ${quantity}\n\nPoderiam me informar a disponibilidade e o valor?`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="eg-site">
      <div className="eg-page">
        {/* Compact header for detail */}
        <header className="eg-header eg-header-detail">
          <div className="eg-brand">
            <span className="eg-brand-name">Estrela Gourmet</span>
          </div>
          <div className="eg-header-actions">
            <Link
              to="/"
              className="eg-icon-button"
              aria-label="Voltar ao catálogo"
            >
              <ChevronLeft size={21} />
            </Link>
            <Link
              to="/interesse"
              className="eg-icon-button eg-bag"
              aria-label="Lista de interesse"
            >
              <ShoppingBag size={22} />
              {items.length > 0 && (
                <span className="eg-bag-count">{items.length}</span>
              )}
            </Link>
          </div>
        </header>

        <main className="eg-detail">
          <div className="eg-detail-nav">
            <button
              onClick={() => window.history.back()}
              aria-label="Voltar ao catálogo"
            >
              <ChevronLeft size={22} />
              <span>Voltar ao cardápio</span>
            </button>
            <span className="eg-detail-script">Estrela Gourmet</span>
            <div />
          </div>

          <div className="eg-detail-columns">
            {/* Gallery */}
            <div className="eg-gallery">
              <div className="eg-detail-image">
                {currentImage?.image_url ? (
                  <img
                    src={currentImage.image_url}
                    alt={currentImage.alt_text || `${product.name}, fotografia ${photoIndex + 1}`}
                  />
                ) : (
                  <div className="grid h-full place-items-center text-primary/30">
                    <CakeSlice size={48} />
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      className="eg-gallery-prev"
                      aria-label="Foto anterior"
                      onClick={() =>
                        setPhotoIndex((i) => (i + images.length - 1) % images.length)
                      }
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      className="eg-gallery-next"
                      aria-label="Próxima foto"
                      onClick={() =>
                        setPhotoIndex((i) => (i + 1) % images.length)
                      }
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="eg-gallery-dots">
                  {images.map((photo, i) => (
                    <button
                      key={photo.id}
                      className={photoIndex === i ? "eg-dot-current" : ""}
                      aria-label={`Ver fotografia ${i + 1}`}
                      aria-pressed={photoIndex === i}
                      onClick={() => setPhotoIndex(i)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="eg-detail-info">
              <h1>{product.name}</h1>
              <p className="eg-detail-price">
                {selectedVariation
                  ? formatBRL(selectedVariation.price)
                  : formatBRL(product.price)}
              </p>
              <p className="eg-detail-description">
                {product.description || product.short_description}
              </p>

              <div className="eg-detail-features">
                <span>
                  <CakeSlice size={24} /> Artesanal
                </span>
                <span>
                  <Gift size={24} /> Para presentear
                </span>
                <span>
                  <Heart size={24} /> Feito com amor
                </span>
              </div>

              {product.product_variations.length > 0 ? (
                <fieldset className="eg-variants">
                  <legend>Selecione uma opção:</legend>
                  <div>
                    {product.product_variations.map((v) => (
                      <button
                        type="button"
                        className={variantId === v.id ? "eg-chosen" : ""}
                        aria-pressed={variantId === v.id}
                        key={v.id}
                        disabled={!v.is_available}
                        onClick={() => setVariantId(v.id)}
                      >
                        {v.name}
                        <small>{formatBRL(v.price)}</small>
                      </button>
                    ))}
                  </div>
                </fieldset>
              ) : (
                <p className="eg-variants-note">
                  Opções e valores serão confirmados pelo WhatsApp.
                </p>
              )}

              <div className="eg-quantity">
                <span>Quantidade</span>
                <div>
                  <button
                    aria-label="Diminuir quantidade"
                    disabled={quantity === 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus size={17} />
                  </button>
                  <strong>{quantity}</strong>
                  <button
                    aria-label="Aumentar quantidade"
                    disabled={quantity === 99}
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  >
                    <Plus size={17} />
                  </button>
                </div>
              </div>

              <button
                className="eg-detail-cta"
                disabled={!product.is_available}
                onClick={addToInterest}
              >
                <MessageCircle size={21} /> Tenho interesse <ArrowRight size={18} />
              </button>
              <button
                className="eg-detail-cta eg-detail-whatsapp"
                disabled={!product.is_available}
                onClick={openWhatsApp}
              >
                <MessageCircle size={21} /> Fazer pedido agora
              </button>
              <p className="eg-detail-disclaimer">
                Consulta sem compromisso. A disponibilidade e o valor serão confirmados pela
                confeiteira.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
