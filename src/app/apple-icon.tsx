import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#4f46e5",
          color: "#ffffff",
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: 110, fontWeight: 700, lineHeight: 1 }}>A</div>
        <div style={{ fontSize: 18, letterSpacing: 4, marginTop: 6 }}>AKAPACK</div>
      </div>
    ),
    { ...size },
  );
}
