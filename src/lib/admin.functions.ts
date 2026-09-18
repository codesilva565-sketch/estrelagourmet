import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const nullablePrice = z.number().nonnegative().max(999999).nullable();

const variationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  price: nullablePrice,
  is_available: z.boolean(),
  display_order: z.number().int().min(0).max(999),
});

const productSchema = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid().nullable(),
  name: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(140),
  short_description: z.string().trim().max(240),
  description: z.string().trim().max(4000),
  price: nullablePrice,
  features: z.array(z.string().trim().min(1).max(120)).max(20),
  is_available: z.boolean(),
  is_featured: z.boolean(),
  is_archived: z.boolean(),
  display_order: z.number().int().min(0).max(999),
  variations: z.array(variationSchema).max(30),
});

const settingsSchema = z.object({
  business_name: z.string().trim().min(1).max(120),
  whatsapp_number: z
    .string()
    .trim()
    .regex(/^\d{0,15}$/),
  instagram_url: z.union([z.literal(""), z.string().trim().url().max(500)]),
  contact_info: z.string().trim().max(1000),
  order_info: z.string().trim().max(1000),
});

async function assertAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Acesso restrito à proprietária.");
}

export const getAdminCatalog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const [
      { data: products, error: productsError },
      { data: categories, error: categoriesError },
      { data: settings, error: settingsError },
    ] = await Promise.all([
      context.supabase
        .from("products")
        .select("*, product_images(*), product_variations(*)")
        .order("display_order")
        .order("created_at"),
      context.supabase.from("categories").select("*").order("display_order"),
      context.supabase.from("site_settings").select("*").eq("id", 1).single(),
    ]);
    const error = productsError ?? categoriesError ?? settingsError;
    if (error) throw new Error(error.message);
    const signedProducts = await Promise.all(
      (products ?? []).map(async (product) => ({
        ...product,
        product_images: await Promise.all(
          (product.product_images ?? [])
            .sort((a, b) => a.display_order - b.display_order)
            .map(async (image) => {
              const { data } = await context.supabase.storage
                .from("catalog-images")
                .createSignedUrl(image.image_url, 3600);
              return { ...image, signed_url: data?.signedUrl ?? null };
            }),
        ),
        product_variations: (product.product_variations ?? []).sort(
          (a, b) => a.display_order - b.display_order,
        ),
      })),
    );
    return { products: signedProducts, categories: categories ?? [], settings };
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => productSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { id, variations, ...values } = data;
    const result = id
      ? await context.supabase.from("products").update(values).eq("id", id).select("id").single()
      : await context.supabase.from("products").insert(values).select("id").single();
    if (result.error || !result.data)
      throw new Error(result.error?.message ?? "Não foi possível salvar o produto.");
    const productId = result.data.id;
    const { error: deleteError } = await context.supabase
      .from("product_variations")
      .delete()
      .eq("product_id", productId);
    if (deleteError) throw new Error(deleteError.message);
    if (variations.length > 0) {
      const { error } = await context.supabase
        .from("product_variations")
        .insert(
          variations.map(({ id: _id, ...variation }) => ({ ...variation, product_id: productId })),
        );
      if (error) throw new Error(error.message);
    }
    return { id: productId };
  });

export const addProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        productId: z.string().uuid(),
        path: z.string().min(1).max(500),
        altText: z.string().trim().max(200),
        displayOrder: z.number().int().min(0).max(999),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("product_images").insert({
      product_id: data.productId,
      image_url: data.path,
      alt_text: data.altText,
      display_order: data.displayOrder,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), path: z.string().min(1).max(500) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error: storageError } = await context.supabase.storage
      .from("catalog-images")
      .remove([data.path]);
    if (storageError) throw new Error(storageError.message);
    const { error } = await context.supabase.from("product_images").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => settingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("site_settings").update(data).eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(60),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  icon: z.string().trim().max(60).nullable(),
  display_order: z.number().int().min(0).max(999),
});

export const saveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => categorySchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { id, ...values } = data;
    const result = id
      ? await context.supabase.from("categories").update(values).eq("id", id).select("id").single()
      : await context.supabase.from("categories").insert(values).select("id").single();
    if (result.error || !result.data) throw new Error(result.error?.message ?? "Não foi possível salvar a categoria.");
    return { id: result.data.id };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
