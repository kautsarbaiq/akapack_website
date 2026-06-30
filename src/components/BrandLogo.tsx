/**
 * Logo Akapack — rekonstruksi vektor logo asli:
 *  • mark "ap" glossy (a merah di depan, p oranye di belakang + ekor pin)
 *  • wordmark "akapack" (font rounded Baloo 2 via var --font-rounded)
 *  • tagline "one stop packaging solution" (oranye, italic)
 * Skala mengikuti `className` (mis. h-11 w-auto). Counter huruf transparan.
 * Untuk logo raster persis: simpan public/logo.png lalu pakai <Image> di SiteHeader.
 */
export function BrandLogo({
  className = "h-11 w-auto",
  tagline = true,
}: {
  className?: string;
  tagline?: boolean;
}) {
  return (
    <svg
      viewBox={tagline ? "0 0 1010 266" : "0 0 1010 210"}
      className={className}
      role="img"
      aria-label="Akapack — one stop packaging solution"
    >
      <defs>
        <linearGradient id="akRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff3a2d" />
          <stop offset="0.55" stopColor="#e21d22" />
          <stop offset="1" stopColor="#c1121f" />
        </linearGradient>
        <linearGradient id="akOrange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb020" />
          <stop offset="0.5" stopColor="#f98a1c" />
          <stop offset="1" stopColor="#e8601a" />
        </linearGradient>
        <linearGradient id="akRedHi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="0.42" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="akOrangeHi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="0.42" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="akDrop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000000" stopOpacity="0.18" />
          <stop offset="1" stopColor="#000000" stopOpacity="0" />
        </linearGradient>

        <path
          id="akA"
          fillRule="evenodd"
          d="M104 66 a64 64 0 1 0 60 92 v34 h28 v-94 a64 64 0 0 0 -88 -32 Z M100 96 a32 32 0 1 0 0.1 0 Z"
        />
        <path
          id="akP"
          fillRule="evenodd"
          d="M150 96 h28 v16 a60 60 0 0 1 50 -26 a64 64 0 0 1 0 128 a60 60 0 0 1 -50 -26 v74 l-28 -40 Z M228 124 a30 30 0 1 0 0.1 0 Z"
        />
        <clipPath id="akAClip">
          <use href="#akA" />
        </clipPath>
        <clipPath id="akPClip">
          <use href="#akP" />
        </clipPath>
      </defs>

      {/* bayangan lembut di bawah mark */}
      <ellipse cx="148" cy="238" rx="104" ry="13" fill="url(#akDrop)" />

      {/* "p" oranye (di belakang, kanan) */}
      <g>
        <use href="#akP" fill="url(#akOrange)" />
        <use href="#akP" fill="none" stroke="#e8601a" strokeWidth="2" strokeOpacity="0.5" />
        <g clipPath="url(#akPClip)">
          <rect x="140" y="86" width="180" height="68" fill="url(#akOrangeHi)" />
          <ellipse cx="200" cy="122" rx="30" ry="17" fill="#ffffff" opacity="0.45" />
        </g>
      </g>

      {/* "a" merah (di depan, kiri) */}
      <g>
        <use href="#akA" fill="url(#akRed)" />
        <use href="#akA" fill="none" stroke="#c1121f" strokeWidth="2" strokeOpacity="0.5" />
        <g clipPath="url(#akAClip)">
          <rect x="30" y="58" width="200" height="74" fill="url(#akRedHi)" />
          <ellipse cx="82" cy="98" rx="34" ry="20" fill="#ffffff" opacity="0.42" />
        </g>
      </g>

      {/* seam gelap tempat "p" menyelip di belakang "a" */}
      <g clipPath="url(#akAClip)">
        <path d="M150 70 q34 22 34 64 q0 46 -34 70 Z" fill="#7a0a10" opacity="0.18" />
      </g>

      {/* wordmark "akapack" */}
      <text
        x="322"
        y="184"
        fontFamily="var(--font-rounded), 'Baloo 2', system-ui, sans-serif"
        fontWeight="700"
        fontSize="172"
        letterSpacing="-5"
        fill="#38322c"
      >
        akapack
      </text>

      {/* tagline */}
      {tagline && (
        <text
          x="992"
          y="248"
          textAnchor="end"
          fontFamily="var(--font-inter), system-ui, sans-serif"
          fontStyle="italic"
          fontWeight="500"
          fontSize="33"
          letterSpacing="0.3"
          fill="#e8762a"
        >
          one stop packaging solution
        </text>
      )}
    </svg>
  );
}
