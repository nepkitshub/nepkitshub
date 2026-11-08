# Oxford Academy — database and backend reference

## Source of truth

Production project ref: `gsfhhvkipvoutqqgyick`.

The database is migration-managed. The Supabase migration ledger is authoritative; do not recreate or bootstrap production from `schema.sql`. That file is deliberately non-executable because its original `oa_admins` email-allowlist model was superseded by the current user-role model.

Production migration ledger recorded in Supabase:

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
| `20261108135618_secure_shared_legacy_access` | Enables RLS on the legacy store tables; preserves public catalog and portfolio reads; denies public access to private customer/order records |

The hosted ledger currently contains 20 migrations. This repository retains executable SQL for the 2026-11-08 Oxford grants migration and the 2026-11-08 shared-access lockdown migration; 18 earlier historical migration files are not present in Git. Do not claim that this repository alone can recreate the hosted database from an empty project. The ledger table above records their names and purposes; a full clean-room schema/data export remains a separate recovery task.


## Shared-project security remediation

The 2026-11-08 `secure_shared_legacy_access` migration was applied to the shared Supabase project.

- RLS is enabled on every public store table (including the previously exposed commerce tables) and on `app_state`; there are now zero non-Oxford public tables with RLS disabled.
- Anonymous and authenticated browser roles no longer have direct read/write access to profiles, password hashes, addresses, carts, orders, order items, payments, shipments, returns, notifications, inventory movements, audit logs, coupons, role tables, or internal media metadata.
- The public store catalogue remains read-only: active products, variants, categories, brands, collections, banners, homepage sections, tags, product relationships, approved reviews and public site settings. Product costing/low-stock thresholds, reserved variant stock and profile password hashes are not selectable.
- Portfolio content remains public-read under its existing publication/visibility policies. The public portfolio contact form can submit bounded fields only; messages cannot be listed by public credentials. Portfolio administration/media metadata remains unavailable through browser credentials until an Auth admin mapping is configured.
- Existing rows were preserved. The migration did not delete or rewrite store orders, order items, shipments or the legacy profile.

**Important compatibility boundary:** the existing store `profiles` record has no matching verified Supabase Auth user. The former `password_hash`-based browser model cannot securely identify that customer, so private customer and admin CRUD operations are intentionally denied rather than exposing them. The store frontend must migrate sign-in to Supabase Auth and use a trusted server-side checkout/admin path before customer cart/order updates and store administration can be re-enabled. Never put a Supabase service-role/secret key in a browser. Public catalogue browsing remains available.

The database tooling did not permit changing default privileges for the underlying object-owner roles. Therefore, every future public-schema table/function must explicitly enable RLS and receive only the required grants/policies in its migration; verify this with the Security Advisor after each schema change.

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

This Supabase project also contains NepKits Hub commerce tables and portfolio tables. The `secure_shared_legacy_access` migration now enables RLS on all previously unprotected non-Oxford public tables, revokes browser-role write privileges, and restores public SELECT only for explicitly public catalog/portfolio content. It does not change Oxford Academy's `oa_*` table policies or the academy media bucket.

Private store tables (profiles, addresses, carts, orders, payments, shipments, returns, notifications, role/permission data, audit logs and internal media) intentionally have no browser-role policy or grant. This is a fail-closed state: the legacy store profile uses a custom password hash and its row does not match a verified Supabase Auth user. It must not be exposed until the store frontend is migrated to Supabase Auth and a server-side checkout/admin flow. Existing commerce records were retained. The public product catalogue remains readable.

Portfolio tables retain published/visible read policies. The contact form has a bounded insert-only policy; message rows cannot be read using public keys. Portfolio administration remains closed until an approved Supabase Auth admin mapping is configured.

A check of the hosted schema now returns zero non-Oxford public tables with RLS disabled. Some private tables intentionally have RLS but no policies; the advisor's informational `RLS Enabled No Policy` findings describe this deny-all state. The migration tooling could not change the owner-level default privileges, so each new public table or function must explicitly enable RLS and receive only narrowly required grants/policies.

## Operational verification

After schema changes:

- Read back the grants and RLS policies for every affected `oa_*` table.
- Run Supabase Security Advisors.
- Exercise `oa_submit_admission` in a transaction that is rolled back.
- Confirm the production enquiries count is unchanged after the rollback test.
- Verify Storage upload and public object reads without exposing any service key.
- Confirm admin user-role writes remain protected by RLS.
