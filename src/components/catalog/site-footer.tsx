import { Gift, Heart, MessageCircle, Sparkles } from "lucide-react";
import type { SiteSettings } from "@/lib/catalog.types";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const items = [
    [Sparkles, "Qualidade artesanal"],
    [MessageCircle, "Atendimento pelo WhatsApp"],
    [Heart, "Doces que conectam"],
  ] as const;
  return (
    <footer className="mt-16 border-t border-border bg-secondary/50 px-4 py-10">
      <div className="mx-auto grid max-w-5xl grid-cols-3 gap-4 text-center">
        {items.map(([Icon, label]) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <Icon className="h-6 w-6 text-primary" />
            <span className="font-display text-sm sm:text-base">{label}</span>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center font-display text-lg italic">
        “Mais que doces, criamos momentos especiais.”{" "}
        <Gift className="inline h-4 w-4 text-primary" />
      </p>
      <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
        {settings.instagram_url && (
          <a href={settings.instagram_url} target="_blank" rel="noreferrer">
            Instagram
          </a>
        )}
        {settings.whatsapp_number && (
          <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        )}
      </div>
    </footer>
  );
}
