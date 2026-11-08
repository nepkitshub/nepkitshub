-- Security remediation for the shared store and portfolio tables.
-- Oxford Academy tables are intentionally excluded.
-- Public users may read approved catalog/portfolio content and submit contact forms.
-- Customer-specific and administrative store data is closed until the legacy custom
-- password_hash account model is migrated to verifiable Supabase Auth identities.

DO $migration$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'app_state','addresses','audit_logs','banners','brands','cart_items','carts',
    'categories','collections','coupons','homepage_sections','inventory_movements',
    'media','notifications','order_items','order_status_events','orders','payments',
    'permissions','product_collections','product_tags','product_variants','products',
    'profiles','promotion_rules','return_items','return_requests','reviews',
    'role_permissions','roles','shipments','site_settings','tags','wishlists'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM anon, authenticated, PUBLIC', table_name);
  END LOOP;
END
$migration$;

CREATE POLICY store_categories_public_read ON public.categories
  FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY store_brands_public_read ON public.brands
  FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY store_collections_public_read ON public.collections
  FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY store_products_public_read ON public.products
  FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY store_product_variants_public_read ON public.product_variants
  FOR SELECT TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM public.products p
            WHERE p.id = product_variants.product_id AND p.active = true)
  );
CREATE POLICY store_banners_public_read ON public.banners
  FOR SELECT TO anon, authenticated USING (
    active = true AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at > now())
  );
CREATE POLICY store_homepage_sections_public_read ON public.homepage_sections
  FOR SELECT TO anon, authenticated USING (
    active = true AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at > now())
  );
CREATE POLICY store_tags_public_read ON public.tags
  FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY store_product_tags_public_read ON public.product_tags
  FOR SELECT TO anon, authenticated USING (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.tags t ON t.id = product_tags.tag_id
      WHERE p.id = product_tags.product_id AND p.active = true AND t.active = true
    )
  );
CREATE POLICY store_product_collections_public_read ON public.product_collections
  FOR SELECT TO anon, authenticated USING (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.collections c ON c.id = product_collections.collection_id
      WHERE p.id = product_collections.product_id AND p.active = true AND c.active = true
    )
  );
CREATE POLICY store_reviews_approved_public_read ON public.reviews
  FOR SELECT TO anon, authenticated USING (approved = true);
CREATE POLICY store_site_settings_public_read ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);

GRANT SELECT (id,name,slug,sku,description,category_id,brand_id,price,sale_price,
  compare_at_price,rating,review_count,stock,is_featured,is_best_seller,
  is_new_arrival,is_sale,tags,active,images,sizes,colors,metadata,created_at,updated_at)
  ON public.products TO anon, authenticated;
GRANT SELECT (id,name,slug,description,image_url,sort_order,active,created_at,updated_at)
  ON public.categories TO anon, authenticated;
GRANT SELECT (id,name,slug,logo_url,active,created_at)
  ON public.brands TO anon, authenticated;
GRANT SELECT (id,name,slug,description,image_url,active,sort_order,created_at)
  ON public.collections TO anon, authenticated;
GRANT SELECT (id,product_id,name,sku,size,color,price,sale_price,stock,image_url,created_at,updated_at)
  ON public.product_variants TO anon, authenticated;
GRANT SELECT (id,type,title,subtitle,image_url,mobile_image_url,cta_text,cta_url,
  sort_order,active,starts_at,ends_at,created_at,updated_at)
  ON public.banners TO anon, authenticated;
GRANT SELECT (id,section_key,title,subtitle,content,sort_order,active,starts_at,ends_at,updated_at)
  ON public.homepage_sections TO anon, authenticated;
GRANT SELECT (id,name,slug,active,created_at)
  ON public.tags TO anon, authenticated;
GRANT SELECT (product_id,tag_id) ON public.product_tags TO anon, authenticated;
GRANT SELECT (product_id,collection_id) ON public.product_collections TO anon, authenticated;
GRANT SELECT (id,product_id,customer_name,rating,comment,verified_purchase,approved,featured,created_at)
  ON public.reviews TO anon, authenticated;
GRANT SELECT (id,store_name,announcement,phone,email,address,currency,
  free_shipping_threshold,flat_shipping_fee,cod_enabled,return_window_days,
  social_links,footer_content,updated_at)
  ON public.site_settings TO anon, authenticated;

DROP POLICY IF EXISTS portfolio_experience_read ON public.portfolio_experience;
DROP POLICY IF EXISTS portfolio_profile_read ON public.portfolio_profile;
DROP POLICY IF EXISTS portfolio_projects_read ON public.portfolio_projects;
DROP POLICY IF EXISTS portfolio_services_read ON public.portfolio_services;
DROP POLICY IF EXISTS portfolio_skills_read ON public.portfolio_skills;
DROP POLICY IF EXISTS portfolio_testimonials_read ON public.portfolio_testimonials;
DROP POLICY IF EXISTS portfolio_statistics_read ON public.portfolio_statistics;
DROP POLICY IF EXISTS portfolio_social_read ON public.portfolio_social_links;
DROP POLICY IF EXISTS portfolio_seo_read ON public.portfolio_seo;
DROP POLICY IF EXISTS portfolio_settings_read ON public.portfolio_site_settings;

DO $migration$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'portfolio_admin_users','portfolio_contact_messages','portfolio_experience',
    'portfolio_media','portfolio_profile','portfolio_project_images','portfolio_projects',
    'portfolio_seo','portfolio_services','portfolio_site_settings','portfolio_skills',
    'portfolio_social_links','portfolio_statistics','portfolio_testimonials'
  ] LOOP
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM anon, authenticated, PUBLIC', table_name);
  END LOOP;
END
$migration$;

GRANT SELECT ON public.portfolio_profile,public.portfolio_projects,
  public.portfolio_project_images,public.portfolio_skills,public.portfolio_experience,
  public.portfolio_services,public.portfolio_testimonials,public.portfolio_statistics,
  public.portfolio_social_links,public.portfolio_site_settings,public.portfolio_seo
TO anon, authenticated;

CREATE POLICY portfolio_contact_public_submit ON public.portfolio_contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(btrim(name)) BETWEEN 2 AND 100
    AND char_length(btrim(email)) BETWEEN 3 AND 254
    AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    AND char_length(btrim(subject)) BETWEEN 2 AND 160
    AND char_length(btrim(message)) BETWEEN 10 AND 5000
    AND status = 'unread' AND source = 'website'
  );
GRANT INSERT (name,email,subject,message)
  ON public.portfolio_contact_messages TO anon, authenticated;
