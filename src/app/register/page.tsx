"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowser();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) {
      setError(error.message || "Gagal mendaftar.");
      setLoading(false);
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setDone(true);
      setLoading(false);
    }
  }

  const input =
    "mt-1 w-full border border-line bg-card px-3 py-2.5 text-sm outline-none focus:border-ink";
  const label = "font-mono text-xs uppercase tracking-[0.1em] text-ink-soft";

  if (done) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-16">
        <h1 className="font-display text-3xl font-medium tracking-tight">Cek email kamu</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Akun berhasil dibuat. Jika diminta, buka email konfirmasi dari kami, lalu masuk.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block bg-indigo px-6 py-3 text-center text-sm font-medium text-white hover:opacity-90"
        >
          Ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-16">
      <div className="font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">Akun Akapack</div>
      <h1 className="mt-3 font-display text-3xl font-medium tracking-tight">Daftar</h1>
      <p className="mt-2 text-sm text-ink-soft">Buat akun untuk belanja lebih cepat.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className={label}>Nama</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={input} autoComplete="name" />
        </div>
        <div>
          <label className={label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={input}
            autoComplete="email"
          />
        </div>
        <div>
          <label className={label}>Kata sandi</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className={input}
            autoComplete="new-password"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Memproses…" : "Daftar"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-indigo-ink hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
