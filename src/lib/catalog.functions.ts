import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CatalogData, Product } from "./catalog.types";
import { MOCK_CATALOG, findMockProduct } from "./mock-catalog";

function isDemoMode() {
  return process.env["DEMO_MODE"] === "true" || import.meta.env["VITE_DEMO_MODE"] === "true";
}

async function signImagePaths<T extends { image_url: string }>(images: T[]) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return Promise.all(
    images.map(async (image) => {
      if (image.image_url.startsWith("http") || image.image_url.startsWith("/")) return image;
      const { data } = await supabaseAdmin.storage
        .from("catalog-images")
        .createSignedUrl(image.image_url, 60 * 60);
      return { ...image, image_url: data?.signedUrl ?? "" };
    }),
  );
}

async function signCatalogPath(path: string | null): Promise<string | null> {
  if (!path) return path;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage
    .from("catalog-images")
    .createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? "";
}

export const getCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<CatalogData> => {
    if (isDemoMode()) return MOCK_CATALOG;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [categoriesResult, productsResult, settingsResult] = await Promise.all([
      supabaseAdmin
        .from("categories")
        .select("id,name,slug,icon,display_order")
        .eq("is_active", true)
        .order("display_order"),
      supabaseAdmin
        .from("products")
        .select(
          "id,category_id,name,slug,short_description,description,price,features,is_available,is_featured,display_order,product_images(id,image_url,alt_text,display_order),product_variations(id,name,price,is_available,display_order)",
        )
        .eq("is_archived", false)
        .order("display_order"),
      supabaseAdmin
        .from("site_settings")
        .select(
          "business_name,whatsapp_number,instagram_url,contact_info,order_info,logo_url,hero_images,hero_title,hero_subtitle",
        )
        .eq("id", 1)
        .single(),
    ]);
    if (categoriesResult.error || productsResult.error || settingsResult.error) {
      throw new Error("Não foi possível carregar o catálogo.");
    }
    const products = await Promise.all(
      (productsResult.data ?? []).map(async (product) => ({
        ...product,
        product_images: await signImagePaths(
          product.product_images.sort((a, b) => a.display_order - b.display_order),
        ),
        product_variations: product.product_variations.sort(
          (a, b) => a.display_order - b.display_order,
        ),
      })),
    );
    const settings = settingsResult.data;
    return {
      categories: categoriesResult.data ?? [],
      products,
      settings: settings && {
        ...settings,
        logo_url: await signCatalogPath(settings.logo_url),
        hero_images: await Promise.all((settings.hero_images ?? []).map(signCatalogPath)),
      },
    } as CatalogData;
  },
);

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().trim().min(1).max(140) }).parse(input),
  )
  .handler(async ({ data }): Promise<Product | null> => {
    if (isDemoMode()) return findMockProduct(data.slug);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select(
        "id,category_id,name,slug,short_description,description,price,features,is_available,is_featured,display_order,product_images(id,image_url,alt_text,display_order),product_variations(id,name,price,is_available,display_order)",
      )
      .eq("slug", data.slug)
      .eq("is_archived", false)
      .maybeSingle();
    if (error) throw new Error("Não foi possível carregar este produto.");
    if (!product) return null;
    return {
      ...product,
      product_images: await signImagePaths(
        product.product_images.sort((a, b) => a.display_order - b.display_order),
      ),
      product_variations: product.product_variations.sort(
        (a, b) => a.display_order - b.display_order,
      ),
    } as Product;
  });
