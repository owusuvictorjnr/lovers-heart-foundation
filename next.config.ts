import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy: only allow what the site actually uses.
 * - Paystack: inline checkout script + iframe
 * - Cloudinary: images + direct admin uploads
 * If you add a new third-party service, add its origin here and test on staging.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://js.paystack.co${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self'",
  "connect-src 'self' https://api.cloudinary.com https://api.paystack.co https://*.paystack.co",
  "frame-src https://checkout.paystack.com https://*.paystack.com https://*.paystack.co",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.paystack.com\")" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig: NextConfig = {
  images: {
    // Cloudinary resizes images on its CDN, which keeps us off paid image-optimisation tiers
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: "1mb" }, // uploads go straight to Cloudinary, never through actions
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Admin pages and APIs must never be cached by browsers or proxies
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;