# Oxford Academic Instruction Pvt. Ltd. — Kushma & Baglung

Public website and Supabase-managed administration portal for Oxford Academic Instruction Pvt. Ltd.

## Build and deployment

- Build command: `npm run build` (runs `node build.js`).
- Output directory: `dist`.
- The build creates the public homepage, admin route, content listings/details, About, Calendar, service pages, sitemap, crawler policy and branded 404 page.
- The final build pass injects the shared design and UX layer into all generated routes.

## Frontend

- `professional-theme.css`: public and admin design system, responsive layouts, cards, forms, focus states, subtle animation and reduced-motion support.
- `professional-ux.js`: skip navigation, accessible labels and external links, keyboard handling and grouped admin navigation.
- `public-branding.js`: reads the saved academy name, logo and logo sizes from Supabase and applies them across the homepage, content pages and admin shell.
- `homepage-overrides.js` and `lions-full-theme.js`: public navigation, live content sections, programme, service, branch, gallery, notice and calendar rendering.

## Backend and security

The live database is managed by Supabase migrations. The current production schema and RLS policies are documented in [DATABASE.md](DATABASE.md). The old bootstrap SQL was removed from active use because it described an earlier allowlist-based model, not the deployed `oa_users` role model.

- Use only the Supabase publishable key in browser code. Never expose a secret or service-role key.
- New academy registrations are assigned the `student` role by the database trigger. They do not receive admin privileges.
- Admin pages and database writes require an authenticated account with `public.oa_users.role = 'admin'`; the database's `private.is_oa_admin()` helper and RLS policies enforce this.
- Public enquiries use the validated `public.oa_submit_admission` function. Do not add direct anonymous write access to the admissions table.
- Public media lives in the `oa-academy-media` bucket. Public reads are intentional; image upload and deletion require an approved admin session.
- The `oa_` table prefix isolates Oxford Academy content from other applications hosted in the same Supabase project. Do not change unrelated NepKits Hub or portfolio tables as part of Oxford work.

## Admin content

The admin portal manages branding and logo, homepage and company text, services, programmes, staff, gallery, notices, testimonials, calendar/events, partners, admission enquiries, and branch contacts. Uploads are validated as JPG, PNG or WebP and limited to 5 MB. The cropped academy logo is saved to Supabase and applied immediately after upload.

Only publish real staff, verified partner relationships and student testimonials with permission. Confirm current schedules, fees, admission requirements and official Japan pathway information before publishing.

## Verification checklist

1. Run `npm run build` and inspect the Vercel build output.
2. Check the homepage, About, Services, Calendar, content pages and admin route at desktop and mobile widths.
3. Submit an enquiry and verify that it is stored through the RPC and visible only to admins.
4. Verify admin sign-in, student-role rejection, role enforcement and password recovery.
5. Upload a logo and an image, then confirm the public URLs render.
6. Check the Supabase security advisor and the `/admin/` crawler exclusion.
