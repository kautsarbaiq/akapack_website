import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-[80vh] bg-paper-2">
      <div className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <span className="font-mono text-sm font-medium tracking-[0.16em]">DASHBOARD</span>
            <nav className="flex gap-4 text-sm">
              <Link href="/dashboard" className="text-ink-soft hover:text-ink">Ringkasan</Link>
              <Link href="/dashboard/produk" className="text-ink-soft hover:text-ink">Produk</Link>
              <Link href="/" className="text-ink-soft hover:text-ink">Lihat situs ↗</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-xs text-ink-soft sm:inline">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button className="border border-line px-3 py-1.5 text-xs font-medium hover:border-ink/40">
                Keluar
              </button>
            </form>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
