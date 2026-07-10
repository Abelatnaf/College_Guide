import { getSupabase } from "@/lib/supabase/client";

/** Bearer header for the AI routes, which verify tier access server-side. */
export async function authHeaders(): Promise<Record<string, string>> {
  const supabase = getSupabase();
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
