-- The admission RPC runs as its caller (SECURITY INVOKER).
-- Give the public form only INSERT privilege; the RLS policy
-- "oa admissions public validated submit" enforces field and branch checks.
-- No SELECT, UPDATE, DELETE or other access is granted here.
grant insert on table public.oa_admissions to anon, authenticated;
