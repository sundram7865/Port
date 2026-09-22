import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the trace root: a stray lockfile further up the drive otherwise makes
  // Next infer the wrong workspace root.
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  // The stylesheet is ~7 KB; inlining it removes a render-blocking round trip
  // that cost ~170 ms before first paint.
  experimental: { inlineCss: true },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // three ships untranspiled ESM examples; keep them in the server-compiled graph
  transpilePackages: ["three"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
