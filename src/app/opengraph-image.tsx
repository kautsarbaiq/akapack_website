import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Akapack — Grosir Kemasan Plastik & Mesin";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4f1e9",
          color: "#1a1916",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: "#4f46e5",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            A
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 8 }}>AKAPACK</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, maxWidth: 920 }}>
            Grosir kemasan plastik &amp; mesin.
          </div>
          <div style={{ fontSize: 30, color: "#6f6e66" }}>
            3.900+ produk · harga grosir · Bandung — Garut
          </div>
        </div>

        <div style={{ height: 12, width: 180, background: "#4f46e5" }} />
      </div>
    ),
    { ...size },
  );
}
