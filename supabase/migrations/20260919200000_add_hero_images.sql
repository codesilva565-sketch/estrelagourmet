ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS hero_images text[] NOT NULL DEFAULT '{}';
