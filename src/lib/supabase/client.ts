import { createBrowserClient } from "@supabase/ssr";

// Singleton browser client. Sessions live in cookies (via @supabase/ssr) so the
// same login is visible to Server Components, Route Handlers and the browser.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
