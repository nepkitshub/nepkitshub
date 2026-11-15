# Oxford Academic Instruction Pvt. Ltd. — main website

The production website now uses the Next.js App Router application at the repository root.

## Technology
- Next.js 16 App Router, React 19 and strict TypeScript
- Tailwind CSS 4 and reusable React components
- Supabase SSR, Auth, Postgres and Storage integration
- Lucide React icons

## Local development
Use Node.js 24 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Checks
```bash
npm run typecheck
npm run lint
npm run build
```

## Backend configuration
The public website can render verified fallback content without a database connection. Admin authentication, CMS editing, enquiries, consultations, staff invitations and media uploads require the dedicated, isolated Supabase database and environment variables.

Apply these migrations to the approved isolated database, in order:

1. `supabase/migrations/202611150001_oa_cms.sql`
2. `supabase/migrations/202611150002_oa_cms_seed_verified_content.sql`

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL` in the hosting project's environment settings. Keep `SUPABASE_SECRET_KEY` server-only. Never commit credentials or connect this CMS to the legacy production database.

After the isolated database is ready, follow the one-time admin bootstrap instructions in `scripts/bootstrap-admin.ts`. Do not enable public admin registration. New public registrations must never receive admin privileges.

## Repository safety
The former static-site generator files are retained as a rollback/reference copy. They are no longer the active application entry point; the root `package.json` and `src/app` define the production Next.js site. The previous nested `oxford-redesign/` copy is also retained for rollback comparison.

Do not publish invented reviews, success rates, partner claims, fees or schedules. Publish student experiences only after permission and administrator approval. Legal policy pages remain drafts until the company approves the wording.
