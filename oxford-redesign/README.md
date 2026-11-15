# Oxford Academic Instruction — new website

This is a separate Next.js App Router application under `oxford-redesign/`. The previous site root, root build command, production branch and production deployment are intentionally untouched.

## Stack
- Next.js App Router 16 / React 19
- TypeScript strict mode
- Tailwind CSS 4
- Supabase SSR packages (backend connection staged pending isolated development database approval)
- Lucide React icons
- Vercel preview project: oxford-academy-redesign

## Local setup
1. Use Node.js 22 or newer.
2. Run `npm install` inside this directory.
3. Copy `.env.example` to `.env.local` if configuring the database later.
4. Run `npm run dev`.

## Scripts
- `npm run dev`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Backend safety status
This initial frontend phase uses the audited and verified content inventory. Enquiry writes, administration, role management and storage mutations are not activated. Do not connect preview forms to the live production database. A separate Supabase development branch is required before backend migrations or writes can be tested.

## Security rules
- Never expose a Supabase secret/service-role key in a browser bundle.
- Never grant admin through user-editable metadata or public self-registration.
- Enforce staff permissions server-side and in RLS.
- Keep enquiries and internal notes private.
- Legal pages remain drafts until the company approves actual legal wording.
