CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY "Public can view active categories" ON public.categories;
DROP POLICY "Admins manage categories" ON public.categories;
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT TO anon, authenticated USING (is_active OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Public can view catalog products" ON public.products;
DROP POLICY "Admins manage products" ON public.products;
CREATE POLICY "Public can view catalog products" ON public.products FOR SELECT TO anon, authenticated USING ((NOT is_archived) OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins manage product images" ON public.product_images;
CREATE POLICY "Admins manage product images" ON public.product_images FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins manage product variations" ON public.product_variations;
CREATE POLICY "Admins manage product variations" ON public.product_variations FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins manage site settings" ON public.site_settings;
CREATE POLICY "Admins manage site settings" ON public.site_settings FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP FUNCTION public.bootstrap_first_admin();
DROP FUNCTION public.has_role(uuid, public.app_role);