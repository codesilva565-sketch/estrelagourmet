import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  LogOut,
  PackagePlus,
  Pencil,
  Plus,
  Save,
  Settings,
  Store,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  addProductImage,
  deleteProductImage,
  getAdminCatalog,
  saveProduct,
  saveSiteSettings,
  saveCategory,
  deleteCategory,
} from "@/lib/admin.functions";
import type { Category, Product, ProductVariation, SiteSettings } from "@/lib/catalog.types";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Área da proprietária — Estela Gourmet" },
      {
        name: "description",
        content: "Acesso seguro para administrar o catálogo Estela Gourmet.",
      },
      { property: "og:title", content: "Área da proprietária — Estela Gourmet" },
      { property: "og:description", content: "Administração segura do catálogo Estela Gourmet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

type AdminVariation = ProductVariation & {
  product_id: string;
  created_at: string;
  updated_at: string;
};
type AdminProduct = Omit<Product, "product_images" | "product_variations"> & {
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  product_images: Array<Product["product_images"][number] & { signed_url?: string | null }>;
  product_variations: AdminVariation[];
};
type AdminData = {
  products: AdminProduct[];
  categories: Category[];
  settings: SiteSettings | null;
};

function AdminPage() {
  const navigate = useNavigate();
  const loadAdmin = useServerFn(getAdminCatalog);
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [accessError, setAccessError] = useState("");

  const refresh = useCallback(async () => {
    setChecking(true);
    setAccessError("");
    try {
      const result = await loadAdmin();
      setData(result as AdminData);
    } catch {
      setAccessError("Este acesso ainda não tem permissão de proprietária.");
    } finally {
      setChecking(false);
    }
  }, [loadAdmin]);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data: authData }) => {
      if (!active) return;
      const signedIn = Boolean(authData.user);
      setSession(signedIn);
      if (signedIn) void refresh();
      else setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, authSession) => {
      if (!active || (event !== "SIGNED_IN" && event !== "SIGNED_OUT")) return;
      setSession(Boolean(authSession));
      if (authSession) void refresh();
      else {
        setData(null);
        setChecking(false);
      }
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [refresh]);

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/", replace: true });
  }

  if (checking) return <CenteredStatus />;
  if (!session) return <LoginForm />;
  if (!data || accessError) return <AccessDenied message={accessError} onSignOut={signOut} />;
  return <Dashboard data={data} refresh={refresh} onSignOut={signOut} />;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (authError) setError("E-mail ou senha inválidos.");
    setBusy(false);
  }
  async function resetPassword() {
    if (!email.trim()) {
      setError("Informe seu e-mail para recuperar a senha.");
      return;
    }
    setBusy(true);
    setError("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (resetError) setError("Não foi possível enviar a recuperação agora.");
    else toast.success("Confira seu e-mail para criar uma nova senha.");
    setBusy(false);
  }
  return (
    <main className="grid min-h-screen place-items-center bg-secondary px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 soft-shadow sm:p-8">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/" aria-label="Voltar ao catálogo">
            <ArrowLeft />
          </Link>
        </Button>
        <p className="mt-5 font-script text-4xl text-primary">Estela Gourmet</p>
        <h1 className="font-display text-4xl font-semibold">Área da proprietária</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Entre para editar produtos, fotos e informações do catálogo.
        </p>
        <form onSubmit={submit} className="mt-7 grid gap-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              maxLength={255}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-11"
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                minLength={6}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 pr-11"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" variant="elegant" size="lg" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} Entrar
          </Button>
          <Button type="button" variant="link" disabled={busy} onClick={resetPassword}>
            Esqueci minha senha
          </Button>
        </form>
      </section>
    </main>
  );
}

function AccessDenied({ message, onSignOut }: { message: string; onSignOut: () => Promise<void> }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 text-center">
      <div className="max-w-md">
        <Store className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 font-display text-3xl font-semibold">Acesso aguardando liberação</h1>
        <p className="mt-3 text-muted-foreground">
          {message || "Seu cadastro existe, mas ainda precisa ser marcado como proprietário."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/">Ver catálogo</Link>
          </Button>
          <Button onClick={() => void onSignOut()}>Sair</Button>
        </div>
      </div>
    </main>
  );
}

function CenteredStatus() {
  return (
    <main className="grid min-h-screen place-items-center bg-background">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Preparando seu catálogo…</p>
      </div>
    </main>
  );
}

function Dashboard({
  data,
  refresh,
  onSignOut,
}: {
  data: AdminData;
  refresh: () => Promise<void>;
  onSignOut: () => Promise<void>;
}) {
  const [selected, setSelected] = useState<AdminProduct | null>(null);
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:flex sm:justify-between sm:px-6">
          <div className="min-w-0">
            <p className="truncate font-script text-3xl text-primary">Estela Gourmet</p>
            <h1 className="truncate font-display text-2xl font-semibold">Painel do catálogo</h1>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/" aria-label="Ver catálogo">
                <Eye />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => void onSignOut()} aria-label="Sair">
              <LogOut />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Tabs defaultValue="products">
          <TabsList className="grid h-11 w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="products">
              <Store className="mr-2 h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Tags className="mr-2 h-4 w-4" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Config
            </TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-6">
            {selected ? (
              <ProductEditor
                product={selected}
                categories={data.categories}
                onClose={() => setSelected(null)}
                onSaved={async () => {
                  await refresh();
                  setSelected(null);
                }}
              />
            ) : (
              <ProductList
                products={data.products}
                onSelect={setSelected}
                onNew={() => setSelected(blankProduct())}
              />
            )}
          </TabsContent>
          <TabsContent value="categories" className="mt-6">
            <CategoryManager categories={data.categories} onSaved={refresh} />
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <SettingsForm settings={data.settings} onSaved={refresh} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ProductList({
  products,
  onSelect,
  onNew,
}: {
  products: AdminProduct[];
  onSelect: (product: AdminProduct) => void;
  onNew: () => void;
}) {
  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold">Produtos</h2>
          <p className="text-sm text-muted-foreground">{products.length} cadastrado(s)</p>
        </div>
        <Button onClick={onNew}>
          <PackagePlus /> Novo produto
        </Button>
      </div>
      <div className="grid gap-3">
        {products.map((product) => (
          <Button
            key={product.id}
            variant="ghost"
            onClick={() => onSelect(product)}
            className="h-auto w-full grid-cols-[64px_minmax(0,1fr)_auto] justify-stretch gap-3 border border-border bg-card p-3 text-left"
          >
            <div className="h-16 w-16 overflow-hidden rounded-md bg-secondary">
              {product.product_images[0]?.signed_url && (
                <img
                  src={product.product_images[0].signed_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-semibold">{product.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {product.is_archived
                  ? "Arquivado"
                  : product.is_available
                    ? "Disponível"
                    : "Indisponível"}
                {product.is_featured ? " • Destaque" : ""}
              </p>
            </div>
            <span className="text-primary">Editar</span>
          </Button>
        ))}
        {products.length === 0 && (
          <div className="border-y border-border py-16 text-center text-muted-foreground">
            Nenhum produto cadastrado.
          </div>
        )}
      </div>
    </>
  );
}

function blankProduct(): AdminProduct {
  return {
    id: "",
    category_id: null,
    name: "",
    slug: "",
    short_description: "",
    description: "",
    price: null,
    features: [],
    is_available: true,
    is_featured: false,
    is_archived: false,
    display_order: 0,
    created_at: "",
    updated_at: "",
    product_images: [],
    product_variations: [],
  };
}

function ProductEditor({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: AdminProduct;
  categories: Category[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const save = useServerFn(saveProduct);
  const addImage = useServerFn(addProductImage);
  const removeImage = useServerFn(deleteProductImage);
  const [form, setForm] = useState(product);
  const [features, setFeatures] = useState(product.features.join("\n"));
  const [busy, setBusy] = useState(false);
  const isNew = !product.id;
  function set<K extends keyof AdminProduct>(key: K, value: AdminProduct[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  function setVariation(index: number, patch: Partial<AdminVariation>) {
    set(
      "product_variations",
      form.product_variations.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await save({
        data: {
          id: form.id || undefined,
          category_id: form.category_id,
          name: form.name.trim(),
          slug: form.slug.trim(),
          short_description: form.short_description.trim(),
          description: form.description.trim(),
          price: form.price,
          features: features
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
          is_available: form.is_available,
          is_featured: form.is_featured,
          is_archived: form.is_archived,
          display_order: form.display_order,
          variations: form.product_variations.map((item, index) => ({
            id: item.id || undefined,
            name: item.name,
            price: item.price,
            is_available: item.is_available,
            display_order: index,
          })),
        },
      });
      toast.success("Produto salvo.");
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }
  async function upload(files: FileList | null) {
    if (!files || !form.id) return;
    setBusy(true);
    try {
      for (const file of Array.from(files).slice(0, 8)) {
        if (!file.type.match(/^image\/(jpeg|png|webp|avif)$/) || file.size > 8 * 1024 * 1024)
          throw new Error("Use imagens JPG, PNG, WEBP ou AVIF de até 8 MB.");
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${form.id}/${crypto.randomUUID()}.${extension}`;
        const { error } = await supabase.storage
          .from("catalog-images")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw error;
        await addImage({
          data: {
            productId: form.id,
            path,
            altText: form.name,
            displayOrder: form.product_images.length,
          },
        });
      }
      toast.success("Fotos enviadas.");
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar as fotos.");
    } finally {
      setBusy(false);
    }
  }
  async function removePhoto(id: string, path: string) {
    setBusy(true);
    try {
      await removeImage({ data: { id, path } });
      toast.success("Foto removida.");
      await onSaved();
    } catch {
      toast.error("Não foi possível remover a foto.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <Button type="button" variant="ghost" onClick={onClose}>
          <ArrowLeft /> Produtos
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Save />} Salvar
        </Button>
      </div>
      <section className="grid gap-5 rounded-lg border border-border bg-card p-4 sm:p-6">
        <h2 className="font-display text-3xl font-semibold">
          {isNew ? "Novo produto" : form.name}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome">
            <Input
              required
              maxLength={120}
              value={form.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (isNew) set("slug", slugify(e.target.value));
              }}
            />
          </Field>
          <Field label="Endereço no catálogo">
            <Input
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              value={form.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
            />
          </Field>
        </div>
        <Field label="Categoria">
          <Select
            value={form.category_id ?? "none"}
            onValueChange={(value) => set("category_id", value === "none" ? null : value)}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem categoria</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Descrição curta">
          <Input
            maxLength={240}
            value={form.short_description}
            onChange={(e) => set("short_description", e.target.value)}
          />
        </Field>
        <Field label="Descrição completa">
          <Textarea
            maxLength={4000}
            rows={5}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Preço (opcional)">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.price ?? ""}
              onChange={(e) => set("price", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Ordem de exibição">
            <Input
              type="number"
              min="0"
              max="999"
              value={form.display_order}
              onChange={(e) => set("display_order", Number(e.target.value))}
            />
          </Field>
        </div>
        <Field label="Características (uma por linha)">
          <Textarea
            value={features}
            maxLength={2500}
            onChange={(e) => setFeatures(e.target.value)}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Toggle
            label="Disponível"
            checked={form.is_available}
            onChange={(value) => set("is_available", value)}
          />
          <Toggle
            label="Destaque"
            checked={form.is_featured}
            onChange={(value) => set("is_featured", value)}
          />
          <Toggle
            label="Arquivado"
            checked={form.is_archived}
            onChange={(value) => set("is_archived", value)}
          />
        </div>
      </section>
      <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-2xl font-semibold">Variações</h3>
            <p className="text-sm text-muted-foreground">Ex.: caixa com 25 ou 50 unidades.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() =>
              set("product_variations", [
                ...form.product_variations,
                {
                  id: "",
                  product_id: form.id,
                  name: "",
                  price: null,
                  is_available: true,
                  display_order: form.product_variations.length,
                  created_at: "",
                  updated_at: "",
                },
              ])
            }
            aria-label="Adicionar variação"
          >
            <Plus />
          </Button>
        </div>
        <div className="mt-4 grid gap-3">
          {form.product_variations.map((variation, index) => (
            <div
              key={`${variation.id}-${index}`}
              className="grid gap-3 border-t border-border pt-3 sm:grid-cols-[1fr_140px_auto_auto]"
            >
              <Input
                required
                placeholder="Nome da opção"
                value={variation.name}
                onChange={(e) => setVariation(index, { name: e.target.value })}
              />
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Preço"
                value={variation.price ?? ""}
                onChange={(e) =>
                  setVariation(index, {
                    price: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
              <Switch
                checked={variation.is_available}
                onCheckedChange={(value) => setVariation(index, { is_available: value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  set(
                    "product_variations",
                    form.product_variations.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <h3 className="font-display text-2xl font-semibold">Fotografias</h3>
        {isNew ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Salve o produto antes de enviar fotografias.
          </p>
        ) : (
          <>
            <Label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground">
              <ImagePlus className="h-4 w-4" /> Enviar fotografias
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                className="sr-only"
                onChange={(e) => void upload(e.target.files)}
              />
            </Label>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {form.product_images.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square overflow-hidden rounded-md bg-secondary"
                >
                  <img
                    src={image.signed_url ?? ""}
                    alt={image.alt_text}
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-1 top-1"
                    onClick={() => void removePhoto(image.id, image.image_url)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </form>
  );
}

function SettingsForm({
  settings,
  onSaved,
}: {
  settings: SiteSettings | null;
  onSaved: () => Promise<void>;
}) {
  const save = useServerFn(saveSiteSettings);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    business_name: settings?.business_name ?? "Estela Gourmet",
    whatsapp_number: settings?.whatsapp_number ?? "",
    instagram_url: settings?.instagram_url ?? "",
    contact_info: settings?.contact_info ?? "",
    order_info: settings?.order_info ?? "",
  });
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await save({ data: { ...form, whatsapp_number: form.whatsapp_number.replace(/\D/g, "") } });
      toast.success("Configurações salvas.");
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      onSubmit={submit}
      className="grid max-w-2xl gap-5 rounded-lg border border-border bg-card p-4 sm:p-6"
    >
      <h2 className="font-display text-3xl font-semibold">Configurações</h2>
      <Field label="Nome da confeitaria">
        <Input
          required
          maxLength={120}
          value={form.business_name}
          onChange={(e) => setForm({ ...form, business_name: e.target.value })}
        />
      </Field>
      <Field label="WhatsApp com DDD">
        <Input
          inputMode="numeric"
          maxLength={18}
          placeholder="5567999999999"
          value={form.whatsapp_number}
          onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
        />
      </Field>
      <Field label="Link do Instagram">
        <Input
          type="url"
          maxLength={500}
          placeholder="https://instagram.com/..."
          value={form.instagram_url}
          onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
        />
      </Field>
      <Field label="Informações de contato">
        <Textarea
          maxLength={1000}
          value={form.contact_info}
          onChange={(e) => setForm({ ...form, contact_info: e.target.value })}
        />
      </Field>
      <Field label="Informações sobre encomendas">
        <Textarea
          maxLength={1000}
          value={form.order_info}
          onChange={(e) => setForm({ ...form, order_info: e.target.value })}
        />
      </Field>
      <Button type="submit" disabled={busy} className="justify-self-start">
        {busy ? <Loader2 className="animate-spin" /> : <Save />} Salvar configurações
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-3">
      <Label>{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function CategoryManager({
  categories,
  onSaved,
}: {
  categories: Category[];
  onSaved: () => Promise<void>;
}) {
  const save = useServerFn(saveCategory);
  const remove = useServerFn(deleteCategory);
  const [editing, setEditing] = useState<Category | null>(null);
  const [busy, setBusy] = useState(false);

  function blank() {
    return { id: "", name: "", slug: "", icon: null, display_order: categories.length } as Category;
  }

  async function handleSave(cat: Category) {
    setBusy(true);
    try {
      await save({ data: cat });
      toast.success("Categoria salva.");
      await onSaved();
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Excluir a categoria "${name}"?`)) return;
    setBusy(true);
    try {
      await remove({ data: { id } });
      toast.success("Categoria excluída.");
      await onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir.");
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <CategoryEditor
        category={editing.id ? editing : blank()}
        isNew={!editing.id}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
        busy={busy}
      />
    );
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold">Categorias</h2>
          <p className="text-sm text-muted-foreground">{categories.length} cadastrada(s)</p>
        </div>
        <Button onClick={() => setEditing(blank())}>
          <Plus /> Nova categoria
        </Button>
      </div>
      <div className="grid gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border border-border rounded-lg bg-card p-3"
          >
            <div>
              <p className="font-display text-lg font-semibold">{cat.name}</p>
              <p className="text-xs text-muted-foreground">/{cat.slug} — ordem {cat.display_order}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setEditing(cat)} aria-label="Editar">
              <Pencil />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id, cat.name)} aria-label="Excluir">
              <Trash2 />
            </Button>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="border-y border-border py-16 text-center text-muted-foreground">
            Nenhuma categoria cadastrada.
          </div>
        )}
      </div>
    </>
  );
}

function CategoryEditor({
  category,
  isNew,
  onSave,
  onCancel,
  busy,
}: {
  category: Category;
  isNew: boolean;
  onSave: (cat: Category) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [form, setForm] = useState(category);
  function set<K extends keyof Category>(key: K, value: Category[K]) {
    setForm((c) => ({ ...c, [key]: value }));
  }
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          <ArrowLeft /> Categorias
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Save />} Salvar
        </Button>
      </div>
      <h2 className="font-display text-3xl font-semibold">
        {isNew ? "Nova categoria" : form.name}
      </h2>
      <Field label="Nome">
        <Input
          required
          maxLength={60}
          value={form.name}
          onChange={(e) => {
            set("name", e.target.value);
            if (isNew) set("slug", slugify(e.target.value));
          }}
        />
      </Field>
      <Field label="Slug">
        <Input
          required
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          value={form.slug}
          onChange={(e) => set("slug", slugify(e.target.value))}
        />
      </Field>
      <Field label="Ícone (nome lucide)">
        <Input
          value={form.icon ?? ""}
          onChange={(e) => set("icon", e.target.value || null)}
          placeholder="ex: CakeSlice, Gift, Heart"
        />
      </Field>
      <Field label="Ordem de exibição">
        <Input
          type="number"
          min="0"
          max="999"
          value={form.display_order}
          onChange={(e) => set("display_order", Number(e.target.value))}
        />
      </Field>
    </form>
  );
}
