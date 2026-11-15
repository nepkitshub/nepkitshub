-- Oxford CMS data model. Additive only: does not alter legacy oa_* tables, commerce tables, or unrelated applications.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table if not exists public.oa_cms_roles (
  id uuid primary key default gen_random_uuid(),
  role_key text not null unique check (role_key in ('super_admin','administrator','content_editor','admissions_staff')),
  label text not null,
  description text not null default '',
  is_system boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.oa_cms_permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text not null unique,
  label text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.oa_cms_role_permissions (
  role_id uuid not null references public.oa_cms_roles(id) on delete cascade,
  permission_id uuid not null references public.oa_cms_permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);
create table if not exists public.oa_cms_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  active boolean not null default true,
  invited_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.oa_cms_staff_role_assignments (
  user_id uuid not null references public.oa_cms_staff(user_id) on delete cascade,
  role_id uuid not null references public.oa_cms_roles(id) on delete restrict,
  assigned_by uuid references public.oa_cms_staff(user_id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create or replace function private.oa_cms_has_permission(p_permission text)
returns boolean
language sql stable security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select exists (
    select 1
    from public.oa_cms_staff s
    join public.oa_cms_staff_role_assignments a on a.user_id = s.user_id
    join public.oa_cms_role_permissions rp on rp.role_id = a.role_id
    join public.oa_cms_permissions p on p.id = rp.permission_id
    where s.user_id = auth.uid()
      and s.active = true
      and p.permission_key = p_permission
  );
$$;
revoke all on function private.oa_cms_has_permission(text) from public;
grant execute on function private.oa_cms_has_permission(text) to authenticated;

create or replace function public.oa_cms_has_permission(p_permission text)
returns boolean
language sql stable security definer
set search_path = pg_catalog, public, private, pg_temp
as $$ select private.oa_cms_has_permission(p_permission); $$;
revoke all on function public.oa_cms_has_permission(text) from public, anon;
grant execute on function public.oa_cms_has_permission(text) to authenticated;

insert into public.oa_cms_roles(role_key,label,description) values
('super_admin','Super Admin','Full access to all CMS functions and staff permissions.'),
('administrator','Administrator','Manage website content, enquiries and settings.'),
('content_editor','Content Editor','Manage approved public content and media.'),
('admissions_staff','Admissions Staff','Manage admissions enquiries and consultation requests.')
on conflict (role_key) do nothing;

insert into public.oa_cms_permissions(permission_key,label) values
('dashboard.read','View dashboard'),('content.read','Read content'),('content.manage','Manage pages and content'),
('content.publish','Publish and unpublish content'),('programs.manage','Manage programmes and levels'),
('services.manage','Manage services'),('examinations.manage','Manage examination information'),
('branches.manage','Manage branches'),('news.manage','Manage news and notices'),('events.manage','Manage events'),
('gallery.manage','Manage gallery'),('testimonials.manage','Review and publish testimonials'),('faqs.manage','Manage FAQs'),
('enquiries.read','View enquiries'),('enquiries.update','Update enquiry status and details'),('enquiries.assign','Assign enquiries'),
('enquiries.export','Export enquiries'),('consultations.manage','Manage consultations'),('media.manage','Manage media library'),
('seo.manage','Manage SEO metadata'),('settings.manage','Manage website settings'),('staff.manage','Manage staff and permissions'),
('logs.read','Read activity logs')
on conflict (permission_key) do nothing;

insert into public.oa_cms_role_permissions(role_id,permission_id)
select r.id,p.id from public.oa_cms_roles r cross join public.oa_cms_permissions p
where r.role_key='super_admin' on conflict do nothing;
insert into public.oa_cms_role_permissions(role_id,permission_id)
select r.id,p.id from public.oa_cms_roles r cross join public.oa_cms_permissions p
where r.role_key='administrator' and p.permission_key <> 'staff.manage' on conflict do nothing;
insert into public.oa_cms_role_permissions(role_id,permission_id)
select r.id,p.id from public.oa_cms_roles r cross join public.oa_cms_permissions p
where r.role_key='content_editor' and p.permission_key in
('dashboard.read','content.read','content.manage','content.publish','programs.manage','services.manage',
'examinations.manage','branches.manage','news.manage','events.manage','gallery.manage','testimonials.manage',
'faqs.manage','media.manage','seo.manage') on conflict do nothing;
insert into public.oa_cms_role_permissions(role_id,permission_id)
select r.id,p.id from public.oa_cms_roles r cross join public.oa_cms_permissions p
where r.role_key='admissions_staff' and p.permission_key in
('dashboard.read','enquiries.read','enquiries.update','enquiries.assign','consultations.manage')
on conflict do nothing;

create table if not exists public.oa_cms_pages (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  title text not null, summary text not null default '',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz, created_by uuid references public.oa_cms_staff(user_id) on delete set null,
  updated_by uuid references public.oa_cms_staff(user_id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.oa_cms_page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.oa_cms_pages(id) on delete cascade,
  section_key text not null, section_type text not null,
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0, visible boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(page_id, section_key)
);
create table if not exists public.oa_cms_navigation_items (
  id uuid primary key default gen_random_uuid(),
  label text not null, href text not null, parent_id uuid references public.oa_cms_navigation_items(id) on delete cascade,
  sort_order integer not null default 0, visible boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.oa_cms_programs (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  title text not null, category text not null default 'Japanese' check(category in ('Japanese','Korean')),
  level_label text not null default 'Language programme', summary text not null default '', overview text not null default '',
  topics jsonb not null default '[]'::jsonb, image_url text not null default '',
  status text not null default 'draft' check(status in ('draft','published','archived')),
  sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.oa_cms_program_levels (
  id uuid primary key default gen_random_uuid(), program_id uuid not null references public.oa_cms_programs(id) on delete cascade,
  level_code text not null, title text not null, description text not null default '',
  sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(program_id,level_code)
);
create table if not exists public.oa_cms_services (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  title text not null, category text not null default 'General', summary text not null default '',
  body text not null default '', highlights jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb, disclaimer text not null default '',
  status text not null default 'draft' check(status in ('draft','published','archived')),
  sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.oa_cms_examinations (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  title text not null, full_name text not null default '', summary text not null default '',
  preparation_topics jsonb not null default '[]'::jsonb, official_note text not null default '',
  status text not null default 'draft' check(status in ('draft','published','archived')),
  sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.oa_cms_branches (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
  address text not null default '', phone text not null default '', whatsapp text not null default '',
  email text not null default '', facebook_url text not null default '', instagram_url text not null default '',
  tiktok_url text not null default '', maps_url text not null default '',
  active boolean not null default true, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.oa_cms_enquiries (
  id uuid primary key default gen_random_uuid(), reference_code text not null unique default ('OA-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
  full_name text not null, email text not null, phone text not null,
  programme_interest text not null default '', service_interest text not null default '',
  preferred_branch_slug text not null default '', preferred_batch text not null default '',
  message text not null default '', consent boolean not null default false,
  status text not null default 'new' check(status in ('new','in_progress','contacted','follow_up_required','converted','closed')),
  assigned_to uuid references public.oa_cms_staff(user_id) on delete set null,
  source text not null default 'website', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (char_length(btrim(full_name)) between 2 and 120),
  check (char_length(btrim(email)) between 5 and 254),
  check (char_length(btrim(phone)) between 7 and 32),
  check (char_length(message) <= 5000)
);
create table if not exists public.oa_cms_enquiry_notes (
  id uuid primary key default gen_random_uuid(), enquiry_id uuid not null references public.oa_cms_enquiries(id) on delete cascade,
  author_id uuid not null references public.oa_cms_staff(user_id) on delete restrict,
  note text not null check(char_length(btrim(note)) between 1 and 5000),
  created_at timestamptz not null default now()
);
create table if not exists public.oa_cms_enquiry_assignments (
  id uuid primary key default gen_random_uuid(), enquiry_id uuid not null references public.oa_cms_enquiries(id) on delete cascade,
  assigned_to uuid not null references public.oa_cms_staff(user_id) on delete restrict,
  assigned_by uuid not null references public.oa_cms_staff(user_id) on delete restrict,
  created_at timestamptz not null default now()
);
create table if not exists public.oa_cms_consultation_requests (
  id uuid primary key default gen_random_uuid(), enquiry_id uuid references public.oa_cms_enquiries(id) on delete set null,
  full_name text not null, email text not null, phone text not null, branch_slug text not null default '',
  requested_at timestamptz, proposed_at timestamptz, confirmed_at timestamptz,
  status text not null default 'requested' check(status in ('requested','proposed','confirmed','completed','cancelled')),
  staff_notes text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.oa_cms_news_categories (
  id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique,
  created_at timestamptz not null default now()
);
create table if not exists public.oa_cms_news_articles (
  id uuid primary key default gen_random_uuid(), category_id uuid references public.oa_cms_news_categories(id) on delete set null,
  slug text not null unique, title text not null, summary text not null default '', body text not null default '',
  cover_image_url text not null default '', status text not null default 'draft' check(status in ('draft','published','archived')),
  published_at timestamptz, created_by uuid references public.oa_cms_staff(user_id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.oa_cms_events (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  title text not null, summary text not null default '', body text not null default '',
  starts_at timestamptz, ends_at timestamptz, venue text not null default '',
  cover_image_url text not null default '', status text not null default 'draft' check(status in ('draft','published','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.oa_cms_gallery_images (
  id uuid primary key default gen_random_uuid(), title text not null, caption text not null default '',
  image_url text not null, alt_text text not null default '', category text not null default 'Academy',
  status text not null default 'draft' check(status in ('draft','published','archived')),
  sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.oa_cms_testimonials (
  id uuid primary key default gen_random_uuid(), student_name text not null, course_name text not null default '',
  quote text not null, photo_url text not null default '', permission_confirmed boolean not null default false,
  status text not null default 'pending' check(status in ('pending','approved','rejected')),
  reviewed_by uuid references public.oa_cms_staff(user_id) on delete set null,
  reviewed_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.oa_cms_faqs (
  id uuid primary key default gen_random_uuid(), category text not null, question text not null,
  answer text not null, status text not null default 'draft' check(status in ('draft','published','archived')),
  sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.oa_cms_media_assets (
  id uuid primary key default gen_random_uuid(), storage_path text not null unique,
  original_name text not null, mime_type text not null, byte_size bigint not null check(byte_size between 1 and 5242880),
  title text not null default '', alt_text text not null default '', uploaded_by uuid references public.oa_cms_staff(user_id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.oa_cms_site_settings (
  setting_key text primary key, setting_value jsonb not null default '{}'::jsonb,
  updated_by uuid references public.oa_cms_staff(user_id) on delete set null, updated_at timestamptz not null default now()
);
create table if not exists public.oa_cms_seo_metadata (
  id uuid primary key default gen_random_uuid(), page_path text not null unique,
  title text not null default '', description text not null default '',
  canonical_url text not null default '', no_index boolean not null default false,
  og_image_url text not null default '', updated_by uuid references public.oa_cms_staff(user_id) on delete set null,
  updated_at timestamptz not null default now()
);
create table if not exists public.oa_cms_activity_logs (
  id uuid primary key default gen_random_uuid(), actor_id uuid references public.oa_cms_staff(user_id) on delete set null,
  action text not null, entity_type text not null, entity_id text not null default '',
  details jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create index if not exists oa_cms_pages_status_idx on public.oa_cms_pages(status,published_at);
create index if not exists oa_cms_programs_status_idx on public.oa_cms_programs(status,sort_order);
create index if not exists oa_cms_services_status_idx on public.oa_cms_services(status,sort_order);
create index if not exists oa_cms_enquiries_created_idx on public.oa_cms_enquiries(created_at desc);
create index if not exists oa_cms_enquiries_status_idx on public.oa_cms_enquiries(status,created_at desc);
create index if not exists oa_cms_enquiries_assignee_idx on public.oa_cms_enquiries(assigned_to,status);
create index if not exists oa_cms_notes_enquiry_idx on public.oa_cms_enquiry_notes(enquiry_id,created_at desc);
create index if not exists oa_cms_news_published_idx on public.oa_cms_news_articles(status,published_at desc);
create index if not exists oa_cms_events_published_idx on public.oa_cms_events(status,starts_at);
create index if not exists oa_cms_gallery_published_idx on public.oa_cms_gallery_images(status,sort_order);
create index if not exists oa_cms_faqs_published_idx on public.oa_cms_faqs(status,category,sort_order);

-- Timestamp maintenance.
create or replace function private.oa_cms_touch_updated_at()
returns trigger language plpgsql set search_path=public,pg_temp as $$
begin new.updated_at = now(); return new; end; $$;
revoke all on function private.oa_cms_touch_updated_at() from public,anon,authenticated;
do $$
declare t text;
begin
  foreach t in array array['oa_cms_staff','oa_cms_pages','oa_cms_page_sections','oa_cms_navigation_items',
  'oa_cms_programs','oa_cms_program_levels','oa_cms_services','oa_cms_examinations','oa_cms_branches',
  'oa_cms_enquiries','oa_cms_consultation_requests','oa_cms_news_articles','oa_cms_events',
  'oa_cms_gallery_images','oa_cms_faqs','oa_cms_site_settings','oa_cms_seo_metadata']
  loop
    execute format('drop trigger if exists %I on public.%I',t||'_touch_updated_at',t);
    execute format('create trigger %I before update on public.%I for each row execute function private.oa_cms_touch_updated_at()',t||'_touch_updated_at',t);
  end loop;
end $$;

-- RLS is mandatory on every CMS table.
do $$
declare t text;
begin
 foreach t in array array['oa_cms_roles','oa_cms_permissions','oa_cms_role_permissions','oa_cms_staff',
 'oa_cms_staff_role_assignments','oa_cms_pages','oa_cms_page_sections','oa_cms_navigation_items',
 'oa_cms_programs','oa_cms_program_levels','oa_cms_services','oa_cms_examinations','oa_cms_branches',
 'oa_cms_enquiries','oa_cms_enquiry_notes','oa_cms_enquiry_assignments','oa_cms_consultation_requests',
 'oa_cms_news_categories','oa_cms_news_articles','oa_cms_events','oa_cms_gallery_images',
 'oa_cms_testimonials','oa_cms_faqs','oa_cms_media_assets','oa_cms_site_settings','oa_cms_seo_metadata','oa_cms_activity_logs']
 loop execute format('alter table public.%I enable row level security',t); end loop;
end $$;

-- Authenticated staff can read their own staff entry; staff-management is separately permission gated.
create policy oa_cms_staff_self_read on public.oa_cms_staff for select to authenticated
using (user_id=auth.uid() or private.oa_cms_has_permission('staff.manage'));
create policy oa_cms_staff_manage on public.oa_cms_staff for all to authenticated
using (private.oa_cms_has_permission('staff.manage')) with check (private.oa_cms_has_permission('staff.manage'));
create policy oa_cms_roles_read on public.oa_cms_roles for select to authenticated
using (private.oa_cms_has_permission('staff.manage'));
create policy oa_cms_roles_manage on public.oa_cms_roles for all to authenticated
using (private.oa_cms_has_permission('staff.manage')) with check (private.oa_cms_has_permission('staff.manage'));
create policy oa_cms_permissions_read on public.oa_cms_permissions for select to authenticated
using (private.oa_cms_has_permission('staff.manage'));
create policy oa_cms_role_permissions_manage on public.oa_cms_role_permissions for all to authenticated
using (private.oa_cms_has_permission('staff.manage')) with check (private.oa_cms_has_permission('staff.manage'));
create policy oa_cms_staff_roles_manage on public.oa_cms_staff_role_assignments for all to authenticated
using (private.oa_cms_has_permission('staff.manage')) with check (private.oa_cms_has_permission('staff.manage'));

-- Public read of published content. All edits remain staff-permission controlled.
create policy oa_cms_pages_public_read on public.oa_cms_pages for select to anon,authenticated
using (status='published' and (published_at is null or published_at<=now()));
create policy oa_cms_pages_manage on public.oa_cms_pages for all to authenticated
using (private.oa_cms_has_permission('content.manage')) with check (private.oa_cms_has_permission('content.manage'));
create policy oa_cms_sections_public_read on public.oa_cms_page_sections for select to anon,authenticated
using (visible and exists(select 1 from public.oa_cms_pages p where p.id=page_id and p.status='published' and (p.published_at is null or p.published_at<=now())));
create policy oa_cms_sections_manage on public.oa_cms_page_sections for all to authenticated
using (private.oa_cms_has_permission('content.manage')) with check (private.oa_cms_has_permission('content.manage'));
create policy oa_cms_navigation_public_read on public.oa_cms_navigation_items for select to anon,authenticated using (visible);
create policy oa_cms_navigation_manage on public.oa_cms_navigation_items for all to authenticated
using (private.oa_cms_has_permission('content.manage')) with check (private.oa_cms_has_permission('content.manage'));

create policy oa_cms_programs_public_read on public.oa_cms_programs for select to anon,authenticated using (status='published');
create policy oa_cms_programs_manage on public.oa_cms_programs for all to authenticated using (private.oa_cms_has_permission('programs.manage')) with check (private.oa_cms_has_permission('programs.manage'));
create policy oa_cms_levels_public_read on public.oa_cms_program_levels for select to anon,authenticated using (exists(select 1 from public.oa_cms_programs p where p.id=program_id and p.status='published'));
create policy oa_cms_levels_manage on public.oa_cms_program_levels for all to authenticated using (private.oa_cms_has_permission('programs.manage')) with check (private.oa_cms_has_permission('programs.manage'));
create policy oa_cms_services_public_read on public.oa_cms_services for select to anon,authenticated using (status='published');
create policy oa_cms_services_manage on public.oa_cms_services for all to authenticated using (private.oa_cms_has_permission('services.manage')) with check (private.oa_cms_has_permission('services.manage'));
create policy oa_cms_exams_public_read on public.oa_cms_examinations for select to anon,authenticated using (status='published');
create policy oa_cms_exams_manage on public.oa_cms_examinations for all to authenticated using (private.oa_cms_has_permission('examinations.manage')) with check (private.oa_cms_has_permission('examinations.manage'));
create policy oa_cms_branches_public_read on public.oa_cms_branches for select to anon,authenticated using (active);
create policy oa_cms_branches_manage on public.oa_cms_branches for all to authenticated using (private.oa_cms_has_permission('branches.manage')) with check (private.oa_cms_has_permission('branches.manage'));

-- Anon can submit a new enquiry only. There is intentionally no public read policy.
grant insert(reference_code,full_name,email,phone,programme_interest,service_interest,preferred_branch_slug,preferred_batch,message,consent,source)
on public.oa_cms_enquiries to anon,authenticated;
create policy oa_cms_enquiries_public_insert on public.oa_cms_enquiries for insert to anon,authenticated
with check (status='new' and assigned_to is null and consent=true
  and char_length(btrim(full_name)) between 2 and 120
  and char_length(btrim(email)) between 5 and 254
  and position('@' in email)>1
  and char_length(btrim(phone)) between 7 and 32
  and char_length(message)<=5000);
create policy oa_cms_enquiries_staff_read on public.oa_cms_enquiries for select to authenticated
using (private.oa_cms_has_permission('enquiries.read'));
create policy oa_cms_enquiries_staff_update on public.oa_cms_enquiries for update to authenticated
using (private.oa_cms_has_permission('enquiries.update')) with check (private.oa_cms_has_permission('enquiries.update'));

create policy oa_cms_notes_staff_read on public.oa_cms_enquiry_notes for select to authenticated using(private.oa_cms_has_permission('enquiries.read'));
create policy oa_cms_notes_staff_write on public.oa_cms_enquiry_notes for insert to authenticated with check(private.oa_cms_has_permission('enquiries.update') and author_id=auth.uid());
create policy oa_cms_assign_read on public.oa_cms_enquiry_assignments for select to authenticated using(private.oa_cms_has_permission('enquiries.read'));
create policy oa_cms_assign_write on public.oa_cms_enquiry_assignments for all to authenticated using(private.oa_cms_has_permission('enquiries.assign')) with check(private.oa_cms_has_permission('enquiries.assign'));
create policy oa_cms_consultations_staff on public.oa_cms_consultation_requests for all to authenticated using(private.oa_cms_has_permission('consultations.manage')) with check(private.oa_cms_has_permission('consultations.manage'));

create policy oa_cms_news_categories_public on public.oa_cms_news_categories for select to anon,authenticated using(exists(select 1 from public.oa_cms_news_articles a where a.category_id=id and a.status='published'));
create policy oa_cms_news_categories_manage on public.oa_cms_news_categories for all to authenticated using(private.oa_cms_has_permission('news.manage')) with check(private.oa_cms_has_permission('news.manage'));
create policy oa_cms_news_public on public.oa_cms_news_articles for select to anon,authenticated using(status='published' and (published_at is null or published_at<=now()));
create policy oa_cms_news_manage on public.oa_cms_news_articles for all to authenticated using(private.oa_cms_has_permission('news.manage')) with check(private.oa_cms_has_permission('news.manage'));
create policy oa_cms_events_public on public.oa_cms_events for select to anon,authenticated using(status='published');
create policy oa_cms_events_manage on public.oa_cms_events for all to authenticated using(private.oa_cms_has_permission('events.manage')) with check(private.oa_cms_has_permission('events.manage'));
create policy oa_cms_gallery_public on public.oa_cms_gallery_images for select to anon,authenticated using(status='published');
create policy oa_cms_gallery_manage on public.oa_cms_gallery_images for all to authenticated using(private.oa_cms_has_permission('gallery.manage')) with check(private.oa_cms_has_permission('gallery.manage'));
create policy oa_cms_testimonials_public on public.oa_cms_testimonials for select to anon,authenticated using(status='approved' and permission_confirmed=true);
create policy oa_cms_testimonials_manage on public.oa_cms_testimonials for all to authenticated using(private.oa_cms_has_permission('testimonials.manage')) with check(private.oa_cms_has_permission('testimonials.manage'));
create policy oa_cms_faqs_public on public.oa_cms_faqs for select to anon,authenticated using(status='published');
create policy oa_cms_faqs_manage on public.oa_cms_faqs for all to authenticated using(private.oa_cms_has_permission('faqs.manage')) with check(private.oa_cms_has_permission('faqs.manage'));
create policy oa_cms_media_manage on public.oa_cms_media_assets for all to authenticated using(private.oa_cms_has_permission('media.manage')) with check(private.oa_cms_has_permission('media.manage'));
create policy oa_cms_settings_read on public.oa_cms_site_settings for select to authenticated using(private.oa_cms_has_permission('settings.manage'));
create policy oa_cms_settings_public_read on public.oa_cms_site_settings for select to anon,authenticated using(setting_key in ('branding','company','site','homepage'));
create policy oa_cms_settings_manage on public.oa_cms_site_settings for all to authenticated using(private.oa_cms_has_permission('settings.manage')) with check(private.oa_cms_has_permission('settings.manage'));
create policy oa_cms_seo_public_read on public.oa_cms_seo_metadata for select to anon,authenticated using(no_index=false);
create policy oa_cms_seo_manage on public.oa_cms_seo_metadata for all to authenticated using(private.oa_cms_has_permission('seo.manage')) with check(private.oa_cms_has_permission('seo.manage'));
create policy oa_cms_activity_read on public.oa_cms_activity_logs for select to authenticated using(private.oa_cms_has_permission('logs.read'));
create policy oa_cms_activity_insert on public.oa_cms_activity_logs for insert to authenticated with check(private.oa_cms_has_permission('dashboard.read') and actor_id=auth.uid());

-- Keep CMS roles/data private from anonymous clients; no public self-registration or role assignment.
revoke all on public.oa_cms_roles,public.oa_cms_permissions,public.oa_cms_role_permissions,
public.oa_cms_staff,public.oa_cms_staff_role_assignments,public.oa_cms_enquiry_notes,
public.oa_cms_enquiry_assignments,public.oa_cms_consultation_requests,public.oa_cms_media_assets,
public.oa_cms_activity_logs from anon;
grant select on public.oa_cms_pages,public.oa_cms_page_sections,public.oa_cms_navigation_items,
public.oa_cms_programs,public.oa_cms_program_levels,public.oa_cms_services,public.oa_cms_examinations,
public.oa_cms_branches,public.oa_cms_news_categories,public.oa_cms_news_articles,public.oa_cms_events,
public.oa_cms_gallery_images,public.oa_cms_testimonials,public.oa_cms_faqs,public.oa_cms_seo_metadata
to anon,authenticated;
grant select,insert,update,delete on public.oa_cms_roles,public.oa_cms_permissions,public.oa_cms_role_permissions,
public.oa_cms_staff,public.oa_cms_staff_role_assignments,public.oa_cms_pages,public.oa_cms_page_sections,
public.oa_cms_navigation_items,public.oa_cms_programs,public.oa_cms_program_levels,public.oa_cms_services,
public.oa_cms_examinations,public.oa_cms_branches,public.oa_cms_enquiries,public.oa_cms_enquiry_notes,
public.oa_cms_enquiry_assignments,public.oa_cms_consultation_requests,public.oa_cms_news_categories,
public.oa_cms_news_articles,public.oa_cms_events,public.oa_cms_gallery_images,public.oa_cms_testimonials,
public.oa_cms_faqs,public.oa_cms_media_assets,public.oa_cms_site_settings,public.oa_cms_seo_metadata,
public.oa_cms_activity_logs to authenticated;

grant select on public.oa_cms_pages,public.oa_cms_page_sections,public.oa_cms_navigation_items,
public.oa_cms_programs,public.oa_cms_program_levels,public.oa_cms_services,public.oa_cms_examinations,
public.oa_cms_branches,public.oa_cms_news_categories,public.oa_cms_news_articles,public.oa_cms_events,
public.oa_cms_gallery_images,public.oa_cms_testimonials,public.oa_cms_faqs,public.oa_cms_seo_metadata,public.oa_cms_site_settings
to anon;


-- Public student feedback enters moderation only. Visitors cannot read or self-approve submissions.
grant insert(student_name,course_name,quote,permission_confirmed)
on public.oa_cms_testimonials to anon,authenticated;
create policy oa_cms_testimonials_public_insert on public.oa_cms_testimonials
for insert to anon,authenticated
with check (
  status='pending'
  and permission_confirmed=true
  and char_length(btrim(student_name)) between 2 and 120
  and char_length(btrim(quote)) between 10 and 4000
  and char_length(course_name)<=150
);

-- Public read is limited to non-sensitive brand and public company settings.
grant select on public.oa_cms_site_settings to anon;

-- Seed only the audited public company records. Never seed sample testimonials, events, FAQs or fictional metrics.
insert into public.oa_cms_programs
(slug,title,category,level_label,summary,overview,topics,image_url,status,sort_order)
values
('japanese-n5','Japanese N5','Japanese','Beginner','Build foundational scripts, basic vocabulary and simple everyday expressions.','Explore the beginner level of the Japanese language programme. Ask Oxford about the current class plan and enrolment availability.',jsonb_build_array('Hiragana and katakana foundations','Basic vocabulary','Simple grammar patterns','Everyday expressions','Introductory listening and reading'),'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85','published',1),
('japanese-n4','Japanese N4','Japanese','Elementary','Develop elementary Japanese grammar, vocabulary and comprehension for familiar situations.','Explore the elementary level of the Japanese language programme. Ask Oxford about the current class plan and enrolment availability.',jsonb_build_array('Elementary grammar','Expanded vocabulary and kanji','Reading familiar texts','Listening to everyday exchanges','Practical communication'),'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=85','published',2),
('japanese-n3','Japanese N3','Japanese','Intermediate','Strengthen practical communication and comprehension of Japanese used in familiar situations.','Explore the intermediate level of the Japanese language programme. Ask Oxford about the current class plan and enrolment availability.',jsonb_build_array('Intermediate grammar','Reading comprehension','Listening comprehension','Vocabulary development','Practical communication'),'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=85','published',3),
('japanese-n2','Japanese N2','Japanese','Upper-intermediate','Build comprehension for more complex Japanese texts and conversations.','Explore the upper-intermediate level listed in Oxford’s Japanese N5–N1 programme. Confirm current classes and availability with the academy.',jsonb_build_array('Advanced grammar patterns','Complex reading','Listening across contexts','Vocabulary and kanji','Formal and informal communication'),'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=1200&q=85','published',4),
('japanese-n1','Japanese N1','Japanese','Advanced','Develop advanced reading, listening and communication skills for complex contexts.','Explore the advanced level listed in Oxford’s Japanese N5–N1 programme. Confirm current classes and availability with the academy.',jsonb_build_array('Advanced reading comprehension','Complex listening','Nuanced vocabulary','High-level grammar','Complex-context communication'),'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=1200&q=85','published',5),
('korean-language','Korean Language','Korean','Language programme','Explore Oxford’s Korean language programme and ask about current levels and learning options.','Oxford lists Korean Language as one of its learning programmes. Contact the academy for the current class level, schedule, course structure and enrolment information.',jsonb_build_array('Programme information','Current learning levels','Course schedule information','Enrolment enquiry and follow-up'),'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1200&q=85','published',6)
on conflict (slug) do nothing;

insert into public.oa_cms_services
(slug,title,category,summary,body,highlights,steps,disclaimer,status,sort_order)
values
('student-visa','Student Visa & Study in Japan Guidance','Study in Japan','Explore Japanese language schools and further-study options with guidance on school selection, applications and documentation.','Planning to study in Japan involves understanding the education system, language expectations, application stages, financial documentation and practical realities of living and studying abroad.',jsonb_build_array('Study and career counselling','Information about Japanese language schools','School selection guidance','Application-stage information','Document checklists','Interview preparation','Follow-up guidance'),jsonb_build_array('Discuss education background and study goals','Review possible schools and courses','Confirm current admission and intake requirements','Organise requested documents','Follow school and visa instructions'),'School admission, Certificate of Eligibility and visa decisions are made by relevant institutions and Japanese authorities. Requirements can change. Admission or visa approval is not guaranteed.','published',1),
('working-visa-language','Language Preparation for Working in Japan','Work in Japan','Build practical Japanese language skills and understand preparation steps relevant to employment pathways.','Language preparation helps learners develop communication skills for daily life and workplace situations. Oxford can discuss goals and information to verify for a chosen route.',jsonb_build_array('Japanese communication skills','Workplace vocabulary','Listening and speaking practice','Language-test guidance','Information about commonly requested documents','Planning support'),jsonb_build_array('Discuss experience and career objectives','Identify work-route and language requirements','Choose language or test-preparation plan','Review employer and authority information'),'A language course does not provide a job offer or work visa. Work eligibility and visa approval depend on the category, employer and Japanese authorities.','published',2),
('ssw','Specified Skilled Worker (SSW) Guidance','Work in Japan','Understand Japanese language and skills preparation relevant to the Specified Skilled Worker pathway.','The SSW pathway can involve Japanese language preparation and a skills assessment for the selected work sector.',jsonb_build_array('SSW pathway introduction','Japanese-language preparation','Language-test guidance','Sector-specific skills-assessment information','Application-information organisation'),jsonb_build_array('Discuss preferred work sector','Check current language and skills tests','Prepare through suitable classes and practice','Confirm employer and application requirements'),'SSW categories, tests, conditions and eligibility can change. Training does not guarantee test results, employment or visa approval.','published',3),
('dependent-visa','Dependent Visa Guidance','Personal and Family Guidance','Understand documents and application steps relevant to eligible family members joining a resident in Japan.','Dependent applications can involve relationship records, financial support information and documents from the family member living in Japan.',jsonb_build_array('Initial family circumstances discussion','Identity and relationship records','Financial support evidence','Document checklists','File organisation','Application information'),jsonb_build_array('Discuss sponsor and family circumstances','Check eligibility and document list','Organise identity, relationship and financial records','Follow official submission instructions'),'Eligibility and documents vary by residence status and individual case. Approval is determined by Japanese authorities.','published',4),
('documentation','Japan Application & Documentation Support','Personal and Family Guidance','Understand and organise academic, identity, sponsor and financial documents requested for Japan-related applications.','Complete and consistent paperwork is important in many study and visa-related applications. Oxford can help applicants understand document categories and organise a checklist.',jsonb_build_array('Passport and identity records','Academic certificates and transcripts','Resume and education or work history','Language-study records and test certificates','Sponsor, employment and income information where required','Financial and relationship records where relevant'),jsonb_build_array('Confirm application type and current checklist','Identify applicant and sponsor documents','Collect and organise requested records','Check names, dates and consistency','Follow receiving institution or authority instructions'),'This is a general guide, not a fixed or exhaustive checklist. Requirements, translations, certifications and financial thresholds vary by case and may change.','published',5),
('career-counselling','Study & Career Counselling','Personal and Family Guidance','Discuss your background, interests and goals before deciding which education or work pathway to explore.','Choosing a course, school or work pathway is an important decision. Oxford’s counselling service helps learners consider background, language preparation needs and available options.',jsonb_build_array('Academic-background discussion','Future-goal discussion','Japanese education and study-route information','School and programme selection guidance','Language and test-preparation planning','Application-stage information'),jsonb_build_array('Share background and future plans','Discuss education or work directions','Identify language, test and document needs','Plan questions and next steps'),'Counselling is informational and does not guarantee school admission, employment, a Certificate of Eligibility or visa approval.','published',6),
('japanese-classes','Japanese Language Classes (N5–N1)','Language Education','Build Japanese language skills across five JLPT levels, from beginner foundations to advanced proficiency.','Explore Japanese language learning from N5 beginner foundations through N1 advanced proficiency. Ask about current class levels, schedules and learning plans.',jsonb_build_array('N5 beginner Japanese','N4 elementary Japanese','N3 intermediate Japanese','N2 upper-intermediate Japanese','N1 advanced Japanese','Grammar, vocabulary, reading, listening and speaking practice'),jsonb_build_array('Discuss previous learning experience','Identify an appropriate level','Ask about current class schedule','Prepare for the next level or test'),'Class schedules, level availability and course duration should be confirmed with the academy before enrolment.','published',7),
('language-tests','Japanese Language Test Preparation','Examination Preparation','Prepare for Japanese proficiency and communication tests through structured learning and practice.','Oxford’s Japanese language preparation can support learners planning to sit proficiency and communication tests. Ask which sessions, levels and classes are currently available.',jsonb_build_array('JLPT preparation','NAT-TEST preparation','J-CERT and JLCT preparation','JFT-Basic preparation','Grammar, vocabulary, reading, listening and communication practice'),jsonb_build_array('Discuss target test and current level','Review preparation plan','Build skills through lessons and practice','Check dates and exam details with provider'),'Exam availability, registration dates, formats and requirements are set by test organisations and may change.','published',8),
('ssw-preparation','SSW Preparation Class','Examination Preparation','Prepare for Japanese-language and sector-specific assessment requirements relevant to the SSW route.','Preparation can include Japanese-language learning, relevant language-test guidance and an introduction to sector-specific assessment information.',jsonb_build_array('Japanese-language preparation','JFT-Basic or other language-test guidance','Sector-specific skills-assessment preparation','Workplace vocabulary','Practical communication'),jsonb_build_array('Choose SSW sector','Check language and skills-assessment requirements','Ask about relevant preparation','Practise for assessments','Confirm employment and application details officially'),'The required language test and skills assessment depend on the sector and current rules. Training does not guarantee test results, employment or visa approval.','published',9),
('korean-classes','Korean Language Classes','Language Education','Explore Oxford’s Korean language programme and ask about current classes and learning options.','Oxford lists Korean Language as one of its learning programmes. Contact the academy for current class level, schedule, course structure and enrolment information.',jsonb_build_array('Programme information and class availability','Guidance on current learning levels','Course schedule information','Enrolment enquiry and follow-up'),jsonb_build_array('Contact the academy with learning goals','Ask about currently available classes','Review course information','Confirm schedule and enrolment details'),'Please contact Oxford to confirm the latest Korean class availability and course details.','published',10)
on conflict (slug) do nothing;

insert into public.oa_cms_examinations
(slug,title,full_name,summary,preparation_topics,official_note,status,sort_order)
values
('jlpt','JLPT Preparation','Japanese-Language Proficiency Test','Structured preparation across vocabulary, grammar, reading and listening.',jsonb_build_array('Vocabulary and kanji','Grammar patterns','Reading practice','Listening and comprehension','Timed practice and review'),'JLPT levels, test dates, venues, fees and registration procedures are managed by official organisers. Confirm current information before registering.','published',1),
('nat-test','NAT-TEST Preparation','Japanese NAT-TEST','Build Japanese language knowledge and practise skills assessed by NAT-TEST.',jsonb_build_array('Vocabulary and kanji','Grammar and language knowledge','Reading comprehension','Listening comprehension','Practice questions and review'),'NAT-TEST dates, venues, fees, levels and registration requirements may change. Confirm current details with the official organiser.','published',2),
('jft-basic','JFT-Basic Preparation','Japan Foundation Test for Basic Japanese','Develop practical Japanese communication skills for everyday situations.',jsonb_build_array('Listening to everyday exchanges','Understanding notices and short texts','Daily-life vocabulary and grammar','Reading for practical information','Task-based practice'),'JFT-Basic availability, registration, fees and official requirements are controlled by the test provider. Confirm current details before applying.','published',3),
('j-cert','J-CERT Preparation','J-CERT','Ask Oxford about current preparation information and availability for J-CERT.',jsonb_build_array('Test information enquiry','Language preparation discussion','Current class availability'),'Current test details and preparation availability must be confirmed with Oxford and the official organiser.','published',4),
('jlct','JLCT Preparation','JLCT','Ask Oxford about current preparation information and availability for JLCT.',jsonb_build_array('Test information enquiry','Language preparation discussion','Current class availability'),'Current test details and preparation availability must be confirmed with Oxford and the official organiser.','published',5),
('ssw','SSW Preparation','Specified Skilled Worker pathway','Prepare for Japanese-language and sector-specific assessment requirements relevant to the SSW route.',jsonb_build_array('Japanese language preparation','Relevant language-test guidance','Sector-specific skills assessment','Workplace vocabulary and communication'),'SSW conditions, tests and eligibility depend on the sector and current Japanese rules. Training does not guarantee a test result, job offer or visa approval.','published',6)
on conflict (slug) do nothing;

insert into public.oa_cms_branches
(slug,name,address,phone,whatsapp,email,facebook_url,instagram_url,tiktok_url,maps_url,active,sort_order)
values
('kushma','Kushma Branch','Kushma, Parbat, Gandaki Province, Nepal','+977 9857631100','+977 9857631100','oxfordmilankushma@gmail.com','https://www.facebook.com/share/1EEb977HqN/?mibextid=wwXIfr','','https://www.tiktok.com/@oxford486?_r=1&_t=ZS-9BQ8PzVqepg','https://maps.app.goo.gl/wVMenxrcrhp1rCcA7?g_st=ic',true,1),
('baglung','Baglung Branch','Baglung, Gandaki Province, Nepal','068-524426','9847601155','oxforddoc55@gmail.com','https://www.facebook.com/share/1HArT3iNJB/?mibextid=wwXIfr','','https://www.tiktok.com/@oxfordacademybaglung?_r=1&_t=ZS-9BQ8w7sM9RN','',true,2)
on conflict (slug) do nothing;

insert into public.oa_cms_news_categories(name,slug) values ('Academic','academic') on conflict (slug) do nothing;
insert into public.oa_cms_news_articles(category_id,slug,title,summary,body,cover_image_url,status,published_at)
select c.id,'online-classes','Online Classes','','Oxford Academy is planning to launch online classes on short notice to ensure students can continue their education without interruption. The initiative aims to provide an effective, accessible, and interactive learning experience through online platforms, with proper class schedules, teacher coordination, and student support.','https://gsfhhvkipvoutqqgyick.supabase.co/storage/v1/object/public/oa-academy-media/content/1794088839037-the-amazing-benefits-of-ca-online-classes-for-students.jpg','published',now()
from public.oa_cms_news_categories c where c.slug='academic'
and not exists(select 1 from public.oa_cms_news_articles a where a.slug='online-classes');

insert into public.oa_cms_gallery_images(title,caption,image_url,alt_text,category,status,sort_order)
select 'Baglung Kalika','A memorable day at Baglung Kalika with our Oxford Academy family! ❤️','https://gsfhhvkipvoutqqgyick.supabase.co/storage/v1/object/public/oa-academy-media/content/1794089248561-660406314_1533374425248818_7855048687995695948_n.jpg','Oxford Academy gathering at Baglung Kalika','Academy','published',1
where not exists(select 1 from public.oa_cms_gallery_images where title='Baglung Kalika');
insert into public.oa_cms_gallery_images(title,caption,image_url,alt_text,category,status,sort_order)
select 'Oxford Academy','Our amazing students, the pride of Oxford Academy! ❤️📚','https://gsfhhvkipvoutqqgyick.supabase.co/storage/v1/object/public/oa-academy-media/content/1794089434010-568624252_1533374425248818_7855048687995695948_n.jpg','Oxford Academy students','Academy','published',2
where not exists(select 1 from public.oa_cms_gallery_images where title='Oxford Academy');

insert into public.oa_cms_site_settings(setting_key,setting_value) values
('branding','{"logo_url":"https://gsfhhvkipvoutqqgyick.supabase.co/storage/v1/object/public/oa-academy-media/branding/1794111699180-WhatsApp-Image-2026-11-08-at-9.03.23-AM.jpeg","brand_name":"OXFORD","tagline":"Learn. Prepare. Progress."}'::jsonb),
('company','{"legal_name":"OXFORD ACADEMIC INSTRUCTION PVT. LTD."}'::jsonb)
on conflict (setting_key) do nothing;

-- No FAQ, event, testimonial or registration claims are seeded: those records require company approval.

-- Default public navigation items are editable through the Navigation Manager.
insert into public.oa_cms_navigation_items(label,href,parent_id,sort_order,visible)
select v.label,v.href,null,v.sort_order,true
from (values ('About','/about',1),('Programs','/programs',2),('Services','/services',3),('Examinations','/examinations',4),('Branches','/branches',5),('More','/news',6)) as v(label,href,sort_order)
where not exists(select 1 from public.oa_cms_navigation_items n where n.parent_id is null and n.label=v.label);
insert into public.oa_cms_navigation_items(label,href,parent_id,sort_order,visible)
select child.label,child.href,parent.id,child.sort_order,true
from (values
 ('Programs','Japanese Language N5–N1','/programs',1),('Programs','Korean Language','/programs/korean-language',2),
 ('More','Our Team','/team',1),('More','Nepali Calendar','/calendar',2),('More','News & Notices','/news',3),
 ('More','Events','/events',4),('More','Gallery','/gallery',5),('More','Student Experiences','/experiences',6),
 ('More','FAQs','/faq',7),('More','Contact','/contact',8)
) as child(parent_label,label,href,sort_order)
join public.oa_cms_navigation_items parent on parent.label=child.parent_label and parent.parent_id is null
where not exists(select 1 from public.oa_cms_navigation_items n where n.parent_id=parent.id and n.label=child.label);

-- Limit uploads and deletes in the public academy bucket to authorised CMS media staff.
create policy oa_cms_media_upload on storage.objects
for insert to authenticated
with check (bucket_id='oa-academy-media' and private.oa_cms_has_permission('media.manage')
  and lower(storage.extension(name)) in ('jpg','jpeg','png','webp'));
create policy oa_cms_media_update on storage.objects
for update to authenticated
using (bucket_id='oa-academy-media' and private.oa_cms_has_permission('media.manage'))
with check (bucket_id='oa-academy-media' and private.oa_cms_has_permission('media.manage')
  and lower(storage.extension(name)) in ('jpg','jpeg','png','webp'));
create policy oa_cms_media_delete on storage.objects
for delete to authenticated
using (bucket_id='oa-academy-media' and private.oa_cms_has_permission('media.manage'));

-- Public visitors may request a consultation, but cannot set staff-controlled appointment fields.
alter table public.oa_cms_consultation_requests
  add column if not exists message text not null default '',
  add column if not exists consent boolean not null default false;
grant insert(full_name,email,phone,branch_slug,requested_at,message,consent)
on public.oa_cms_consultation_requests to anon,authenticated;
create policy oa_cms_consultation_public_insert
on public.oa_cms_consultation_requests
for insert to anon,authenticated
with check (
  status='requested'
  and proposed_at is null
  and confirmed_at is null
  and staff_notes=''
  and consent=true
  and char_length(btrim(full_name)) between 2 and 120
  and char_length(btrim(email)) between 5 and 254
  and position('@' in email)>1
  and char_length(btrim(phone)) between 7 and 32
  and char_length(message)<=3000
);


-- The existing public media bucket is recreated in the isolated development database if absent.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('oa-academy-media','oa-academy-media',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

-- Storage writes for the new CMS are limited to staff with the media.manage permission.
-- The bucket remains public-read; no anonymous upload, update or delete access is granted.
create policy oa_cms_storage_insert
on storage.objects for insert to authenticated
with check (
  bucket_id = 'oa-academy-media'
  and private.oa_cms_has_permission('media.manage')
);

create policy oa_cms_storage_update
on storage.objects for update to authenticated
using (
  bucket_id = 'oa-academy-media'
  and private.oa_cms_has_permission('media.manage')
)
with check (
  bucket_id = 'oa-academy-media'
  and private.oa_cms_has_permission('media.manage')
);

create policy oa_cms_storage_delete
on storage.objects for delete to authenticated
using (
  bucket_id = 'oa-academy-media'
  and private.oa_cms_has_permission('media.manage')
);
