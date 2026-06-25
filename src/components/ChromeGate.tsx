"use client";

import { usePathname } from "next/navigation";

/**
 * Sembunyikan chrome situs publik (header/footer) di area aplikasi internal
 * (/dashboard & /login) supaya tampil sebagai dashboard murni. Client component
 * ringan — tidak mematahkan static rendering halaman publik.
 */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/login")) return null;
  return <>{children}</>;
}
