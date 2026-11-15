import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CmsPermissionResult =
  | { ok: true; userId: string; supabase: Awaited<ReturnType<typeof createServerSupabaseClient>> }
  | { ok: false; status: 401 | 403 | 503; reason: string };

export async function requireCmsPermission(permission: string): Promise<CmsPermissionResult> {
  let supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  try {
    supabase = await createServerSupabaseClient();
  } catch {
    return { ok: false, status: 503, reason: "The secure CMS database is not configured in this environment." };
  }

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims?.sub === "string" ? claimsData.claims.sub : null;
  if (claimsError || !userId) return { ok: false, status: 401, reason: "Please sign in to continue." };

  const { data: allowed, error } = await supabase.rpc("oa_cms_has_permission", { p_permission: permission });
  if (error) return { ok: false, status: 503, reason: "Staff permissions could not be verified." };
  if (allowed !== true) return { ok: false, status: 403, reason: "Your staff account does not have access to this area." };

  return { ok: true, userId, supabase };
}
