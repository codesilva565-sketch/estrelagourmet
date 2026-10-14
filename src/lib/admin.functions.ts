import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
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
  logo_url: z.string().nullable().optional(),
  hero_images: z.array(z.string().trim()).max(10).optional(),
  hero_title: z.string().trim().max(160).optional(),
  hero_subtitle: z.string().trim().max(240).optional(),
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: z.string().min(1).max(128) }).parse(input))
  .handler(async ({ data }) => {
    const { adminPassword, createAdminToken } = await import("@/lib/admin-session.server");
    if (data.password !== adminPassword()) {
      throw new Error("Senha incorreta.");
    }
    return { token: createAdminToken() };
  });

const uploadTargetSchema = z.object({
  folder: z
    .string()
    .trim()
    .regex(/^[a-z0-9][a-z0-9/_-]*$/)
    .max(120),
  extension: z.enum(["jpg", "jpeg", "png", "webp", "avif"]),
});

export const createImageUploadTarget = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input) => uploadTargetSchema.parse(input))
  .handler(async ({ data, context }) => {
    const path = `${data.folder}/${crypto.randomUUID()}.${data.extension}`;
    const { data: signed, error } = await context.supabase.storage
      .from("catalog-images")
      .createSignedUploadUrl(path);
    if (error || !signed)
      throw new Error(error?.message ?? "Não foi possível preparar o envio da imagem.");
    return { path, token: signed.token };
  });

export const getAdminCatalog = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
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
              if (image.image_url.startsWith("http") || image.image_url.startsWith("/")) {
                return { ...image, signed_url: image.image_url };
              }
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
  .middleware([requireAdmin])
  .inputValidator((input) => productSchema.parse(input))
  .handler(async ({ data, context }) => {
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
  .middleware([requireAdmin])
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
    const { error } = await context.supabase.from("product_images").insert({
      product_id: data.productId,
      image_url: data.path,
      alt_text: data.altText,
      display_order: data.displayOrder,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addProductImageUrl = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input) =>
    z
      .object({
        productId: z.string().uuid(),
        imageUrl: z.string().url().max(2000),
        altText: z.string().trim().max(200),
        displayOrder: z.number().int().min(0).max(999),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("product_images").insert({
      product_id: data.productId,
      image_url: data.imageUrl,
      alt_text: data.altText,
      display_order: data.displayOrder,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProductImage = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), path: z.string().min(1).max(500) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    if (!data.path.startsWith("http") && !data.path.startsWith("/")) {
      const { error: storageError } = await context.supabase.storage
        .from("catalog-images")
        .remove([data.path]);
      if (storageError) throw new Error(storageError.message);
    }
    const { error } = await context.supabase.from("product_images").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setProductImageCover = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), productId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: images, error } = await context.supabase
      .from("product_images")
      .select("id")
      .eq("product_id", data.productId)
      .order("display_order");
    if (error) throw new Error(error.message);
    const ordered = [
      data.id,
      ...(images ?? []).map((image) => image.id).filter((id) => id !== data.id),
    ];
    for (let index = 0; index < ordered.length; index++) {
      const { error: updateError } = await context.supabase
        .from("product_images")
        .update({ display_order: index })
        .eq("id", ordered[index]);
      if (updateError) throw new Error(updateError.message);
    }
    return { ok: true };
  });

export const saveSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input) => settingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { hero_images, logo_url, hero_title, hero_subtitle, ...rest } = data;
    const updateData: Database["public"]["Tables"]["site_settings"]["Update"] = { ...rest };
    if (logo_url !== undefined) updateData.logo_url = logo_url;
    if (hero_images) updateData.hero_images = hero_images;
    if (hero_title !== undefined) updateData.hero_title = hero_title;
    if (hero_subtitle !== undefined) updateData.hero_subtitle = hero_subtitle;
    const { error } = await context.supabase.from("site_settings").update(updateData).eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const uploadSiteImage = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input) =>
    z
      .object({
        type: z.enum(["logo", "hero"]),
        file: z.string(),
        altText: z.string().trim().max(200),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { type, file, altText } = data;
    const extension = file.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `site/${type}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await context.supabase.storage
      .from("catalog-images")
      .upload(path, Buffer.from(file, "base64"), {
        contentType: `image/${extension === "jpg" ? "jpeg" : extension}`,
        upsert: false,
      });
    if (uploadError) throw new Error(uploadError.message);
    const { data: publicData } = context.supabase.storage.from("catalog-images").getPublicUrl(path);
    return { path, url: publicData.publicUrl };
  });

export const deleteSiteImage = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input) =>
    z
      .object({
        type: z.enum(["logo", "hero"]),
        path: z.string().min(1).max(500),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { path } = data;
    const { error } = await context.supabase.storage.from("catalog-images").remove([path]);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(60),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(80),
  icon: z.string().trim().max(60).nullable(),
  display_order: z.number().int().min(0).max(999),
});

export const saveCategory = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input) => categorySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...values } = data;
    const result = id
      ? await context.supabase.from("categories").update(values).eq("id", id).select("id").single()
      : await context.supabase.from("categories").insert(values).select("id").single();
    if (result.error || !result.data)
      throw new Error(result.error?.message ?? "Não foi possível salvar a categoria.");
    return { id: result.data.id };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
