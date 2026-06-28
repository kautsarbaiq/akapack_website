/**
 * Logo Akapack (perkiraan vektor: lingkaran "a" + "p" + teks "akapack").
 * Untuk memakai logo asli (raster), simpan file di public/logo.png lalu ganti
 * komponen ini dengan <Image src="/logo.png" .../>.
 */
export function BrandLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 250 64"
      className={className}
      role="img"
      aria-label="Akapack"
      fill="none"
    >
      {/* a — cincin merah */}
      <circle cx="32" cy="30" r="20" stroke="#e2231a" strokeWidth="11" />
      {/* p — cincin abu + tangkai */}
      <circle cx="70" cy="30" r="20" stroke="#8a8d8f" strokeWidth="11" />
      <rect x="44.5" y="30" width="11" height="28" rx="5.5" fill="#8a8d8f" />
      <text
        x="104"
        y="42"
        fontFamily="var(--font-grotesk), system-ui, sans-serif"
        fontSize="34"
        fontWeight="500"
        fill="#6f6e66"
        letterSpacing="0.5"
      >
        akapack
      </text>
    </svg>
  );
}
