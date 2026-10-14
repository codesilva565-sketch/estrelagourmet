const KEY = "eg-demo-overrides";

export type DemoOverrides = {
  business_name?: string;
  whatsapp_number?: string;
  instagram_url?: string;
  contact_info?: string;
  order_info?: string;
  hero_title?: string;
  hero_subtitle?: string;
  logo_url?: string | null;
  hero_images?: string[];
};

export function readDemoOverrides(): DemoOverrides {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as DemoOverrides;
  } catch {
    return {};
  }
}

export function writeDemoOverrides(patch: DemoOverrides): void {
  if (typeof window === "undefined") return;
  const current = readDemoOverrides();
  window.localStorage.setItem(KEY, JSON.stringify({ ...current, ...patch }));
}

export function clearDemoOverrides(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });
}
