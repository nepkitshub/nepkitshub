# Oxford Academic Instruction — main website

This Next.js App Router application is the website deployed through the existing **Oxford Academy Kushma** Vercel project. It lives in the `oxford-redesign/` folder of the existing repository so the legacy site files remain available for rollback and reference; it is not intended to be a separate public website.

## Stack
- Next.js App Router 16 / React 19
- TypeScript strict mode
- Tailwind CSS 4
- Supabase SSR, Auth, Postgres and Storage
- Lucide React icons

## Local setup
1. Use Node.js 22 or newer.
2. Run `npm install` inside this directory.
3. Copy `.env.example` to `.env.local`.
4. Set the public Supabase URL and publishable key only after the isolated development database is approved and configured.
5. Keep `SUPABASE_SECRET_KEY` server-only. Never use a `NEXT_PUBLIC_` prefix for it.
6. Run `npm run dev`.

## Scripts
- `npm run dev`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run bootstrap:admin` — one-time first administrator provisioning after the isolated database migration has been applied.

## Backend setup sequence
1. Create/approve an isolated Supabase development branch. Do not connect the new app to the production database.
2. Apply both SQL migrations in order: `supabase/migrations/202611150001_oa_cms.sql`, then `supabase/migrations/202611150002_oa_cms_seed_verified_content.sql`.
3. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL` in the existing Oxford Academy Kushma Vercel project. The current project URL is `https://oxford-academy-kushma.vercel.app`; use the approved custom domain only after its DNS and email records have been safely prepared.
4. Configure the Supabase secret key as a server-only Vercel environment variable for staff invitations and provisioning.
5. Set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_FULL_NAME` locally and run `npm run bootstrap:admin` once. The script refuses to proceed if a CMS staff record already exists, and grants the initial Super Admin role to only that invited account.
6. Remove the bootstrap environment variables after provisioning.
7. Invite subsequent staff from the private Admin → Staff & Permissions module.

## Data and safety
The migration is additive and uses `oa_cms_*` tables. It does not alter old `oa_*` tables or unrelated applications. No public self-registration creates staff or admin accounts. Enquiries, private notes, consultation records and activity logs are protected by row-level security and permission checks. Student experiences are displayed only after explicit permission and administrator approval.

Public pages can render verified fallback content without a database connection. Admin authentication, CMS editing, enquiry/consultation persistence, staff invitations and media uploads require the isolated Supabase database and environment variables to be configured first. Do not point the new CMS to the live legacy database.

Legal policy pages remain unpublished drafts until the company approves actual legal wording.
