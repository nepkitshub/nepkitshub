-- Oxford Academy website tables; oa_ prefix keeps this data isolated from other app tables.
create extension if not exists pgcrypto;

create table if not exists public.oa_admins (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);
create table if not exists public.oa_site_content (
  content_key text primary key,
  value_en text not null default '',
  value_np text not null default '',
  updated_at timestamptz not null default now()
);
create table if not exists public.oa_programs (
  id uuid primary key default gen_random_uuid(),
  title_en text not null, title_np text not null default '',
  grade_range text not null default '',
  description_en text not null default '', description_np text not null default '',
  is_published boolean not null default false, sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.oa_notices (
  id uuid primary key default gen_random_uuid(),
  title_en text not null, title_np text not null default '',
  category text not null default 'Notice',
  image_url text not null default '',
  body_en text not null default '', body_np text not null default '',
  is_published boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.oa_faculty (
  id uuid primary key default gen_random_uuid(),
  name text not null, role_en text not null default '', role_np text not null default '',
  bio_en text not null default '', bio_np text not null default '',
  photo_url text not null default '',
  is_published boolean not null default false, sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.oa_gallery (
  id uuid primary key default gen_random_uuid(),
  title_en text not null, title_np text not null default '',
  image_url text not null, caption_en text not null default '', caption_np text not null default '',
  is_published boolean not null default false, sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.oa_admissions (
  id uuid primary key default gen_random_uuid(),
  student_name text not null, guardian_name text, phone text not null,
  email text, grade text, message text,
  status text not null default 'new' check (status in ('new','contacted','closed')),
  created_at timestamptz not null default now()
);

alter table public.oa_admins enable row level security;
alter table public.oa_site_content enable row level security;
alter table public.oa_programs enable row level security;
alter table public.oa_notices enable row level security;
alter table public.oa_faculty enable row level security;
alter table public.oa_gallery enable row level security;
alter table public.oa_admissions enable row level security;

drop policy if exists "oa admins read self" on public.oa_admins;
create policy "oa admins read self" on public.oa_admins for select to authenticated
using (email = lower((select auth.jwt()->>'email')));

drop policy if exists "oa content public read" on public.oa_site_content;
create policy "oa content public read" on public.oa_site_content for select to anon, authenticated using (true);
drop policy if exists "oa content admin write" on public.oa_site_content;
create policy "oa content admin write" on public.oa_site_content for all to authenticated
using (exists (select 1 from public.oa_admins a where a.email = lower((select auth.jwt()->>'email'))))
with check (exists (select 1 from public.oa_admins a where a.email = lower((select auth.jwt()->>'email'))));

drop policy if exists "oa programs public read" on public.oa_programs;
create policy "oa programs public read" on public.oa_programs for select to anon, authenticated
using (is_published or exists (select 1 from public.oa_admins a where a.email = lower((select auth.jwt()->>'email'))));
drop policy if exists "oa programs admin write" on public.oa_programs;
create policy "oa programs admin write" on public.oa_programs for all to authenticated
using (exists (select 1 from public.oa_admins a where a.email = lower((select auth.jwt()->>'email'))))
with check (exists (select 1 from public.oa_admins a where a.email = lower((select auth.jwt()->>'email'))));

drop policy if exists "oa notices public read" on public.oa_notices;
create policy "oa notices public read" on public.oa_notices for select to anon, authenticated
using (is_published or exists (select 1 from public.oa_admins a where a.email = lower((select auth.jwt()->>'email'))));
drop policy if exists "oa notices admin write" on public.oa_notices;
create policy "oa notices admin write" on public.oa_notices for all to authenticated
using (exists (select 1 from public.oa_admins a where a.email = lower((select auth.jwt()->>'email'))))
with check (exists (select 1 from public.oa_admins a where a.email = lower((select auth.jwt()->>'email'))));

drop policy if exists "oa faculty public read" on public.oa_faculty;
create policy "oa faculty public read" on public.oa_faculty for select to anon, authenticated
using (is_published or exists (select 1 from public.oa_admins a where a.email = lower((select auth.jwt()->>'email'))));
drop policy if exists "oa faculty admin write" on public.oa_faculty;
create policy "oa faculty admin write" on public.oa_faculty for all to authenticated
using (exists (select 1 from public.oa_admins a where a.email = lower((select auth.jwt()->>'email'))))
with check (exists (select 1 from public.oa_admins a where a.email = lower((select auth.jwt()->>'email'))));

drop policy if exists "oa gallery public read" on public.oa_gallery;
create policy "oa gallery public read" on public.oa_gallery for select to anon, authenticated
using (is_published or exists (select 1 from public.oa_admins a where a.email = lower((select auth.jwt()->>'email'))));
drop policy if exists "oa gallery admin write" on public.oa_gallery;
create policy "oa gallery admin write" on public.oa_gallery for all to authenticated
using (exists (select 1 from public.oa_admins a where a.email = lower((select auth.jwt()->>'email'))))
with check (exists (select 1 from public.oa_admins a where a.email = lower((select auth.jwt()->>'email'))));

drop policy if exists "oa admissions public insert" on public.oa_admissions;
create policy "oa admissions public insert" on public.oa_admissions for insert to anon, authenticated with check (status = 'new');
drop policy if exists "oa admissions admin read" on public.oa_admissions;
create policy "oa admissions admin read" on public.oa_admissions for select to authenticated
using (exists (select 1 from public.oa_admins a where a.email = lower((select auth.jwt()->>'email'))));
drop policy if exists "oa admissions admin update" on public.oa_admissions;
create policy "oa admissions admin update" on public.oa_admissions for update to authenticated
using (exists (select 1 from public.oa_admins a where a.email = lower((select auth.jwt()->>'email'))))
with check (exists (select 1 from public.oa_admins a where a.email = lower((select auth.jwt()->>'email'))));

grant select on public.oa_site_content, public.oa_programs, public.oa_notices, public.oa_faculty, public.oa_gallery to anon, authenticated;
grant select on public.oa_admins, public.oa_admissions to authenticated;
grant insert, update, delete on public.oa_site_content, public.oa_programs, public.oa_notices, public.oa_faculty, public.oa_gallery to authenticated;
grant insert (student_name, guardian_name, phone, email, grade, message) on public.oa_admissions to anon, authenticated;
grant update (status) on public.oa_admissions to authenticated;

insert into public.oa_site_content (content_key, value_en, value_np) values
('hero_title','A place to learn, grow & lead.','सिक्ने, बढ्ने र नेतृत्व गर्ने थलो।'),
('hero_subtitle','Building knowledge, nurturing character and inspiring every learner to discover their potential.','ज्ञान, चरित्र र आत्मविश्वास विकास गर्दै प्रत्येक विद्यार्थीलाई आफ्नो क्षमता पहिचान गर्न प्रेरित गर्ने।'),
('hero_note','Learning today. Shaping tomorrow.','आज सिकौँ। भोलि निर्माण गरौँ।'),
('about_badge','Learn with purpose. Grow with confidence.','उद्देश्यका साथ सिकौँ। आत्मविश्वासका साथ बढौँ।'),
('about_title','Education that helps every learner move forward.','हरेक विद्यार्थीलाई अघि बढ्न सहयोग गर्ने शिक्षा।'),
('about_text','Oxford Academy is a learning community in Kushma, Parbat. This space is where the academy can introduce its story, educational approach and the values it wants every learner to carry forward.','अक्सफोर्ड एकेडेमी पर्वतको कुश्मामा रहेको सिकाइ समुदाय हो। विद्यालयको इतिहास, शैक्षिक दृष्टिकोण र मूल्य मान्यताबारे आधिकारिक विवरण यहाँ थप्न सकिन्छ।'),
('mission_title','Every learner deserves the chance to shine.','हरेक विद्यार्थीले चम्किने अवसर पाउनुपर्छ।'),
('mission_text','Discover a learning environment where questions are encouraged and progress is celebrated.','प्रश्नलाई प्रोत्साहन र प्रगतिलाई सम्मान गर्ने सिकाइ वातावरण खोज्नुहोस्।'),
('contact_address','Kushma, Parbat, Gandaki Province, Nepal','कुश्मा, पर्वत, गण्डकी प्रदेश, नेपाल'),
('contact_email','',''),('contact_phone','','')
on conflict (content_key) do nothing;

-- After creating the admin in Supabase Auth, allowlist their lower-case email:
-- insert into public.oa_admins(email) values ('admin@example.com') on conflict do nothing;
