import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Teacher avatars / card images live in Supabase Storage public buckets
  // (dev + prod projects). next/image needs the hosts allow-listed.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hjgumjfrljoietbzciyl.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "ntofcpjwulypvjcsytqv.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      // Dev seed data uses stock photos; harmless to allow in prod too.
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Apple's AASA file is required to be served as application/json (or
  // application/octet-stream, but JSON is the recommended type) without
  // any redirects. The file lives at public/.well-known/apple-app-site-
  // association (no extension), so Next defaults its MIME to a binary
  // type and breaks Apple's CDN fetch. Force the correct Content-Type.
  //
  // Android's Digital Asset Links file (assetlinks.json) is fetched by
  // the system verifier on app install / update. Vercel already serves
  // .json with application/json so a Content-Type header isn't strictly
  // required, but we pin it explicitly to mirror the AASA setup and
  // keep the cache window discoverable from one place.
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=300" },
        ],
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=300" },
        ],
      },
    ];
  },
};

export default nextConfig;
