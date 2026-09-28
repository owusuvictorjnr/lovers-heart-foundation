import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1b3d2f 0%, #0d241b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "#d4a373",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
            }}
          >
            ❤️
          </div>
          <span style={{ fontSize: "32px", fontWeight: "bold", letterSpacing: "0.5px", color: "#fefae0" }}>
            {siteConfig.name}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#ffffff",
              maxWidth: "950px",
              margin: 0,
            }}
          >
            Every child deserves to know they are loved.
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#ccd5ae",
              maxWidth: "850px",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Bringing food, clothing, education supplies, and hope to children&apos;s homes across Ghana.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255, 255, 255, 0.15)",
            paddingTop: "24px",
          }}
        >
          <span style={{ fontSize: "20px", color: "#d4a373", fontWeight: 600 }}>
            Ghana-Based Non-Profit Organization
          </span>
          <span style={{ fontSize: "18px", color: "rgba(255,255,255,0.7)" }}>
            loversheartfoundation.org
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
