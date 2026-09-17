import { Link } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";
import type { Product } from "@/lib/catalog.types";

function formatBRL(price: number | null) {
  return price == null
    ? "Sob consulta"
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
}

export function ProductCard({ product }: { product: Product }) {
  const image = product.product_images[0];
  return (
    <article className="eg-product-card">
      <Link
        to="/produto/$slug"
        params={{ slug: product.slug }}
        className="eg-product-photo"
        aria-label={`Ver ${product.name}`}
      >
        {image?.image_url ? (
          <img src={image.image_url} alt={image.alt_text || product.name} loading="lazy" />
        ) : (
          <span className="grid h-full place-items-center text-primary/30">
            <ImageIcon className="h-10 w-10" />
          </span>
        )}
      </Link>
      <div className="eg-product-card-body">
        <h3>{product.name}</h3>
        <p>{product.short_description}</p>
        <span className="eg-card-price">{formatBRL(product.price)}</span>
        <Link to="/produto/$slug" params={{ slug: product.slug }} className="eg-card-cta">
          Tenho interesse
        </Link>
      </div>
    </article>
  );
}
