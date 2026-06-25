import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client — guarded so the whole app works with NO Supabase
 * configured. When the env vars are absent, `getSupabase()` returns null and
 * every feature transparently falls back to localStorage (anonymous mode).
 *
 * Auth is fully client-side (PKCE + detectSessionInUrl), so the statically
 * prerendered `/universities/[slug]` pages never touch cookies and stay SSG.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when both Supabase env vars are present. Drives whether auth UI shows. */
export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/** Lazily-created singleton browser client, or null when Supabase isn't configured. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
  }
  return client;
}
