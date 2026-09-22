import { ImageResponse } from "next/og";

import { site } from "@/content/site";

export const alt = `${site.name} | ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated at build time rather than shipped as a static PNG, so the card can
 * never drift out of sync with the site's own copy.
 */
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
          background: "#0a0c10",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#2dd4bf",
              display: "flex",
            }}
          >
            {site.role}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 76,
              fontWeight: 700,
              color: "#e8ecf1",
              letterSpacing: -2,
              display: "flex",
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 30,
              lineHeight: 1.4,
              color: "#8b96a5",
              maxWidth: 900,
              display: "flex",
            }}
          >
            I build systems where being wrong is expensive.
          </div>
        </div>

        <div style={{ display: "flex", gap: 56 }}>
          {[
            ["600+", "users"],
            ["744/s", "events, zero loss"],
            ["2,152", "tests"],
          ].map(([value, label]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 40, fontWeight: 700, color: "#e8ecf1", display: "flex" }}>{value}</div>
              <div style={{ fontSize: 20, color: "#737e8d", marginTop: 6, display: "flex" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
