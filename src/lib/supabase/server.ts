import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server Components / Route Handlers client. `setAll` is a no-op failure inside
// Server Components (cookies are read-only there) — middleware owns the session
// refresh, so swallowing that write is the documented @supabase/ssr pattern.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component; middleware refreshes sessions.
          }
        },
      },
    },
  );
}
