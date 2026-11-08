# Oxford Academy — database and backend reference

## Source of truth

Production project ref: `gsfhhvkipvoutqqgyick`.

The database is migration-managed. The Supabase migration ledger is authoritative; do not recreate or bootstrap production from `schema.sql`. That file is deliberately non-executable because its original `oa_admins` email-allowlist model was superseded by the current user-role model.

Current Oxford migrations recorded in Supabase:

| Migration | Purpose |
|---|---|
| `20261107161528_oxford_academy_media_storage` | Academy media bucket and admin storage policies |
| `20261107195542_add_oxford_branches_and_branch_enquiries` | Branches, branch contact fields and branch-aware enquiry support |
| `20261107195718_allow_public_content_rls_admin_helper_execution` | Admin-helper execution permissions required by content RLS |
| `20261107201254_add_validated_public_admission_submission` | Validated public admission submission function |
| `20261107201401_restrict_admission_table_to_admin_and_submission_rpc` | Restricts direct admissions access |
| `20261107213359_add_staff_contact_and_address_fields` | Staff contact columns |
| `20261107222528_add_branch_google_maps_link` | Branch map links |
| `20261108050624_add_oxford_services_and_testimonials` | Service and testimonial content |
| `20261108051031_add_oxford_public_calendar` | Events and intake dates |
| `20261108051504_add_oxford_partner_institutions` | Partner institution content |
| `20261108051818_restrict_public_write_grants_oxford_content_tables` | Public write grant reduction for new Oxford content tables |
| `20261108055210_limit_oxford_anon_table_grants` | Final least-privilege anonymous grants: public content read-only |

## Data model

All academy-managed records use the `oa_` prefix:

- `oa_site_content`: homepage and company copy, logo URL, logo sizing and hero image URL.
- `oa_programs`, `oa_services`: programmes, language courses and support services.
- `oa_faculty`, `oa_gallery`, `oa_notices`: public staff profiles, images and announcements.
- `oa_testimonials`, `oa_events`, `oa_partners`: approved testimonials, published calendar items and confirmed partner information.
- `oa_branches`: active branch locations and contact channels.
- `oa_admissions`: private admission enquiries.
- `oa_users`: the app-specific user record and role.
- `oa_admins`: legacy compatibility table from the earlier prototype; not the active admin authorization source.

There are two active public branches in production: Kushma and Baglung. Do not hardcode branch-specific contact details in a new component; read the current branch record.

## Authentication and authorization

1. A user signs up through Supabase Auth with the Oxford app marker.
2. A database trigger inserts an `oa_users` row with the `student` role.
3. Only an approved administrator can change that row's role to `admin`.
4. The browser checks the user's `oa_users.role` before opening the manager.
5. `private.is_oa_admin()` independently checks `auth.uid()` against `oa_users`; RLS policies use it for writes and private reads.

Never grant admin based on a submitted email address, a browser-controlled user metadata field, or a client-side flag. Keep the security-definer helper in the non-exposed `private` schema.

## Public reads and writes

Public pages may read published content and active branch data. The content tables grant the `anon` database role SELECT only; writes require an authenticated admin session and must also satisfy the relevant RLS policy.

The admissions form calls `public.oa_submit_admission`. It validates student name, phone, email length and that the selected branch is active, then inserts a new enquiry. The browser does not receive direct SELECT/INSERT privileges on `oa_admissions`. The admin portal reads enquiries and updates their status after role checks and RLS evaluation. The function is intentionally callable by `anon` and `authenticated`; Supabase's security advisor flags this public SECURITY DEFINER RPC, which is expected for the public form but should remain narrow, validated and reviewed. Its fixed empty `search_path`, fully qualified table references and active-branch validation are part of that boundary.

## Media storage

Bucket: `oa-academy-media`.

- Public bucket: image display URLs can be rendered by the public site.
- Allowed MIME types: JPEG, PNG and WebP.
- Maximum file size: 5 MB.
- Public SELECT access is intentional.
- Upload and delete operations are restricted to authenticated Oxford admins by Storage RLS policies.
- Uploads use unique paths rather than overwriting objects.

Payment proofs and other private documents must not be placed in this public bucket. Use a separate private bucket and a reviewed authorization flow if those features are introduced.

## Shared Supabase project boundary

This Supabase project also contains NepKits Hub commerce tables and portfolio tables. Oxford fixes must be scoped to `oa_*` objects and `oa-academy-media`. Do not blanket-enable/rewrite policies on other applications as part of the academy deployment.

A separate Supabase security-advisor run reports 33 non-Oxford public tables with RLS disabled, including commerce tables such as products, profiles, carts, orders and payments, plus portfolio tables. The current table inventory showed those tables empty at the time of review, but their grants and future use need a separate application-by-application policy audit. They are outside this site's scope and were not modified by the Oxford work. Do not expose customer or order data through them until RLS and role-specific policies are designed and tested.

## Operational verification

After schema changes:

- Read back the grants and RLS policies for every affected `oa_*` table.
- Run Supabase Security Advisors.
- Exercise `oa_submit_admission` in a transaction that is rolled back.
- Confirm the production enquiries count is unchanged after the rollback test.
- Verify Storage upload and public object reads without exposing any service key.
- Confirm admin user-role writes remain protected by RLS.
