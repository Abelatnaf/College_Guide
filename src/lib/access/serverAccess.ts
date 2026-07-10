import { createClient } from "@supabase/supabase-js";
import { meetsTier, type Tier } from "@/lib/access/tiers";

/**
 * Server-side gate for the AI routes, which cost real Gemini API money per
 * call. The app's auth is otherwise fully client-side, so this is the one
 * place access is actually enforced on the server rather than just in the UI.
 *
 * The caller must send `Authorization: Bearer <access_token>` (the signed-in
 * user's Supabase session token). We verify it with Supabase Auth, then read
 * the profile through a client scoped to that same token so RLS's
 * `auth.uid()` resolves correctly — no service_role key needed.
 */
export async function requireTier(
  request: Request,
  minTier: Tier,
): Promise<{ ok: true } | { ok: false; status: number }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return { ok: false, status: 503 };

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { ok: false, status: 401 };

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) return { ok: false, status: 401 };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, access_tier, access_status")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profile?.is_admin) return { ok: true };
  if (profile?.access_status !== "approved") return { ok: false, status: 402 };
  if (!meetsTier(profile.access_tier as Tier | null, minTier)) return { ok: false, status: 402 };
  return { ok: true };
}
