ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS hero_title text NOT NULL DEFAULT 'Pequenos detalhes, grandes momentos',
  ADD COLUMN IF NOT EXISTS hero_subtitle text NOT NULL DEFAULT 'Brigadeiros que tornam a vida mais doce.';
