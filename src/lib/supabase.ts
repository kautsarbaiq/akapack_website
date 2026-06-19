import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Client Supabase publik (anon key) untuk membaca katalog.
 * Aman dipakai di server maupun klien — hanya operasi baca publik.
 */
export function getSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY belum di-set di .env.local",
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false },
  });
  return cached;
}

export const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export const OUTLETS = {
  bandung: "00000000-0000-0000-0000-000000000002",
  garut: "00000000-0000-0000-0000-000000000003",
} as const;

export type OutletKey = keyof typeof OUTLETS;
