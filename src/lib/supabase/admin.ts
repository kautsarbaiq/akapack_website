import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Client Supabase ADMIN (service_role) — HANYA untuk server (webhook pembayaran,
 * jembatan ke kasir/POS). Jangan pernah diimpor dari komponen klien.
 * Butuh env SUPABASE_SERVICE_ROLE_KEY (legacy JWT service_role).
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY belum di-set (env server).");
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}
