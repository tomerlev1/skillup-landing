import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Apple's AASA file is required to be served as application/json (or
  // application/octet-stream, but JSON is the recommended type) without
  // any redirects. The file lives at public/.well-known/apple-app-site-
  // association (no extension), so Next defaults its MIME to a binary
  // type and breaks Apple's CDN fetch. Force the correct Content-Type.
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
    ];
  },
};

export default nextConfig;
