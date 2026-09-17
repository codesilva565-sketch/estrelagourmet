CREATE POLICY "Admins can view catalog image files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'catalog-images' AND private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload catalog image files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'catalog-images'
  AND private.has_role(auth.uid(), 'admin')
  AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'avif')
);

CREATE POLICY "Admins can update catalog image files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'catalog-images' AND private.has_role(auth.uid(), 'admin'))
WITH CHECK (
  bucket_id = 'catalog-images'
  AND private.has_role(auth.uid(), 'admin')
  AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'avif')
);

CREATE POLICY "Admins can delete catalog image files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'catalog-images' AND private.has_role(auth.uid(), 'admin'));