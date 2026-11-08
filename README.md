# Oxford Academic Instruction Pvt. Ltd. — Kushma & Baglung

Public website and Supabase-managed administration portal for Oxford Academic Instruction Pvt. Ltd., serving visitors from Kushma and Baglung, Nepal.

## Build and deployment

- Build command: `npm run build` (runs `node build.js`)
- Output directory: `dist`
- Runtime dependencies are loaded by the browser from the configured Supabase client package.
- The build generates the homepage, admin route, content listings/details, About, Calendar, service pages, sitemap, robots policy, and a branded 404 page.

## Design system

The public site and admin portal share a single design layer:

- `professional-theme.css` contains the maintained visual system, responsive breakpoints, shared forms/cards, admin theme, focus states, and reduced-motion support.
- `professional-ux.js` contains progressive accessibility improvements: skip navigation, form-label association, external-link rel attributes, responsive navigation keyboard behaviour, and grouped admin navigation.
- The final build pass in `build.js` injects those two assets into every generated HTML route. Update the shared files rather than adding route-specific overrides where possible.

The site is designed mobile-first and uses the Oxford navy/blue/gold identity. Public content remains English-only.

## Database and admin security

The site uses the Supabase browser publishable key. Never expose a Supabase secret or service-role key in browser code or source files.

Create the academy administrator in Supabase Authentication, then grant the approved account the admin role in `public.oa_users`. New registrations do not receive administrator privileges automatically. Admin access is verified from the user's database role. Row-level security policies remain responsible for authorizing database operations.

Admission enquiries are submitted through the validated `oa_submit_admission` database function. Do not replace it with unrestricted anonymous writes to the admissions table.

## Content management

Use the admin portal to manage the academy's branding, logo, homepage and company content, services, programmes, staff, gallery, notices, testimonials, calendar events, partners, admissions and branch contact details.

Only publish real staff, verified partner relationships and student testimonials with permission. Confirm current class dates, fees, admission requirements, visa eligibility and official guidance before publishing claims.

## Before publishing

1. Run `npm run build` and confirm it completes successfully.
2. Check the public homepage and all generated routes at desktop and mobile widths.
3. Test an enquiry and confirm it appears in the admin portal.
4. Test admin sign-in, role enforcement and password recovery.
5. Check the sitemap and confirm `/admin/` is excluded from indexing.
