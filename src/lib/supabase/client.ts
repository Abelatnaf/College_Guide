import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client. In production this is always configured — the app
 * is paid, and AccessGate (src/components/auth/AccessGate.tsx) requires
 * sign-in + an approved payment on every route except marketing/legal pages
 * and /payment. When the env vars are absent (e.g. a bare local checkout with
 * no .env.local), `getSupabase()` returns null and AccessGate disables the
 * paywall as a dev-only escape hatch rather than crashing the app.
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
