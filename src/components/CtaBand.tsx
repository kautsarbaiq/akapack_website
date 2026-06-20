import { WA_PRIMARY, waLink } from "@/lib/site";

interface Props {
  title?: string;
  body?: string;
  waText?: string;
}

/** Pita ajakan konsultasi WhatsApp — penutup halaman. */
export function CtaBand({
  title = "Bingung pilih yang mana?",
  body = "Tim kami siap bantu pilih kemasan atau mesin yang pas untuk usahamu. Konsultasi gratis lewat WhatsApp.",
  waText = "Halo Akapack, saya mau konsultasi kebutuhan kemasan/mesin.",
}: Props) {
  return (
    <section className="bg-indigo text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">{title}</h2>
          <p className="mt-2 max-w-xl text-white/80">{body}</p>
        </div>
        <a
          href={waLink(WA_PRIMARY, waText)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 bg-white px-6 py-3 text-sm font-medium text-indigo transition-opacity hover:opacity-90"
        >
          Chat WhatsApp
        </a>
      </div>
    </section>
  );
}
