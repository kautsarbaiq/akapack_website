"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Default ke /dashboard: karyawan langsung masuk; pembeli otomatis dipantulkan
  // ke beranda oleh proxy (karena bukan staf). Hanya izinkan path internal
  // (cegah open-redirect ke domain luar).
  const rawNext = params.get("next");
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email atau kata sandi salah.");
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-16">
      <div className="font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">
        Akun Akapack
      </div>
      <h1 className="mt-3 font-display text-3xl font-medium tracking-tight">Masuk</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Masuk untuk belanja lebih cepat. Karyawan diarahkan otomatis ke dashboard.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-line bg-card px-3 py-2.5 text-sm outline-none focus:border-ink"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">
            Kata sandi
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border border-line bg-card px-3 py-2.5 text-sm outline-none focus:border-ink"
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Memproses…" : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-indigo-ink hover:underline">
          Daftar di sini
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
