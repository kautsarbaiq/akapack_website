import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Favicon brand: monogram "A" putih di atas indigo.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4f46e5",
          color: "#ffffff",
          fontSize: 24,
          fontWeight: 700,
          fontFamily: "monospace",
        }}
      >
        A
      </div>
    ),
    { ...size },
  );
}
