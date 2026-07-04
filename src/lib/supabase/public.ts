import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cookie-free anon client for PUBLIC data only (taxonomy, teacher cards,
// published reviews). Using this — never the cookie/session client — in public
// Server Components keeps those routes statically renderable (ISR) for SEO.
// Anything session-aware must use lib/supabase/server.ts instead.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
