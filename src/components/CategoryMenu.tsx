"use client";

import { useState } from "react";
import Link from "next/link";

interface Group {
  slug: string;
  label: string;
}

/** Tombol "Kategori" + panel mega-menu (gaya marketplace). Daftar grup statis. */
export function CategoryMenu({ groups }: { groups: Group[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-full items-center gap-2 rounded-md bg-indigo px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Kategori
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={"transition-transform " + (open ? "rotate-180" : "")}
        >
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Tutup menu kategori"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div className="absolute left-0 top-full z-40 mt-1 w-[min(92vw,640px)] rounded-xl border border-line bg-card p-2 shadow-card-hover">
            <div className="grid grid-cols-2 gap-0.5 sm:grid-cols-3">
              {groups.map((g) => (
                <Link
                  key={g.slug}
                  href={`/produk/grup/${g.slug}`}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-paper-2 hover:text-indigo-ink"
                >
                  {g.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
