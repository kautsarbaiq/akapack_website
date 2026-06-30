"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Banner } from "@/lib/catalog";

/** Banner hero full-width: geser kiri/kanan, auto-scroll tiap 5 detik, panah & titik. */
export function HeroCarousel({ slides }: { slides: Banner[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const n = slides.length;

  const go = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const t = ((i % n) + n) % n;
    el.scrollTo({ left: t * el.clientWidth, behavior: "smooth" });
    setIdx(t);
  };

  useEffect(() => {
    if (n <= 1) return;
    const id = setInterval(() => {
      const el = ref.current;
      if (!el) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % n;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
      setIdx(next);
    }, 5000);
    return () => clearInterval(id);
  }, [n]);

  return (
    <section className="relative bg-ink">
      <div
        ref={ref}
        onScroll={(e) => setIdx(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="thin-scroll flex snap-x snap-mandatory overflow-x-auto"
      >
        {slides.map((s) => (
          <div
            key={s.id}
            className="relative h-[300px] w-full shrink-0 snap-start sm:h-[460px] lg:h-[580px]"
          >
            {s.link ? (
              <Link href={s.link} className="block h-full w-full">
                <Image src={s.image_url} alt="" fill priority sizes="100vw" className="object-cover" />
              </Link>
            ) : (
              <Image src={s.image_url} alt="" fill priority sizes="100vw" className="object-cover" />
            )}
          </div>
        ))}
      </div>

      {n > 1 && (
        <>
          <button
            onClick={() => go(idx - 1)}
            aria-label="Sebelumnya"
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-xl text-white backdrop-blur transition hover:bg-black/60"
          >
            ‹
          </button>
          <button
            onClick={() => go(idx + 1)}
            aria-label="Berikutnya"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-xl text-white backdrop-blur transition hover:bg-black/60"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                aria-label={`Banner ${i + 1}`}
                className={
                  "h-2 rounded-full transition-all " +
                  (i === idx ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80")
                }
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
