# Oxford Academy — Kushma, Parbat

Bilingual English / नेपाली website and admin portal for Oxford Academy.

## Deploy
Vercel build command: `npm run build`
Output directory: `dist`
Install command: leave blank (no dependencies).

## Database
Run `schema.sql` in the Supabase SQL Editor. Then create the academy administrator in Supabase Authentication and add their lower-case email to `public.oa_admins`:
```sql
insert into public.oa_admins (email) values ('admin@example.com') on conflict do nothing;
```

The site uses a Supabase publishable key in the browser. Never expose a secret/service-role key.

## Before promotion
Replace illustrative classroom stock photos with academy-owned images and update the official phone, email, programmes, staff, notices and history through the admin portal.
