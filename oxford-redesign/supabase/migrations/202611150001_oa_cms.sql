-- Oxford CMS data model. Additive only: does not alter legacy oa_* tables, commerce tables, or unrelated applications.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to anon, authenticated;

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
set search_path = public, pg_temp
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
grant execute on function private.oa_cms_has_permission(text) to anon, authenticated;

create or replace function public.oa_cms_has_permission(p_permission text)
returns boolean
language sql stable security definer
set search_path = public, private, pg_temp
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
  title text not null, summary text not null default '', overview text not null default '',
  image_url text not null default '', status text not null default 'draft' check(status in ('draft','published','archived')),
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
public.oa_cms_gallery_images,public.oa_cms_testimonials,public.oa_cms_faqs,public.oa_cms_seo_metadata
to anon;
