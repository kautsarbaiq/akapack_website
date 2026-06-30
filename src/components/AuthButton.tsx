"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

const CLS =
  "rounded-lg border border-indigo/40 bg-card px-3.5 py-2 text-sm font-medium text-indigo-ink transition-colors hover:bg-indigo-wash";

/** Tombol Masuk (belum login) / Keluar (sudah login) di header situs. */
export function AuthButton() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!email) {
    return (
      <Link href="/login" className={CLS}>
        Masuk
      </Link>
    );
  }

  async function logout() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    setEmail(null);
    router.refresh();
  }

  return (
    <button onClick={logout} className={CLS} title={email}>
      Keluar
    </button>
  );
}
