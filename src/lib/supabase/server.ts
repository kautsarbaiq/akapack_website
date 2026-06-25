import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase untuk Server Component / Route Handler / Server Action,
 * terikat cookie sesi (auth karyawan). Operasi tunduk pada RLS sesuai user
 * yang login — INI yang dipakai dashboard, bukan service_role.
 */
export async function createSupabaseServer() {
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
            // Dipanggil dari Server Component (read-only cookies) — diabaikan;
            // proxy.ts yang menyegarkan sesi.
          }
        },
      },
    },
  );
}
