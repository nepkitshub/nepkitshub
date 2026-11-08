-- Public pages only need anonymous SELECT access to published academy content.
-- Admin writes remain authenticated and subject to private.is_oa_admin() RLS.
-- This migration is scoped only to Oxford Academy tables; do not change other
-- applications that share this Supabase project.

revoke all privileges on table
  public.oa_admins,
  public.oa_site_content,
  public.oa_programs,
  public.oa_notices,
  public.oa_faculty,
  public.oa_gallery,
  public.oa_branches,
  public.oa_services,
  public.oa_testimonials,
  public.oa_events,
  public.oa_partners
from anon;

grant select on table
  public.oa_site_content,
  public.oa_programs,
  public.oa_notices,
  public.oa_faculty,
  public.oa_gallery,
  public.oa_branches,
  public.oa_services,
  public.oa_testimonials,
  public.oa_events,
  public.oa_partners
to anon;
