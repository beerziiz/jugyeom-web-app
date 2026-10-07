import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Screenshots are downscaled in the browser first; this leaves room for one per request.
    serverActions: { bodySizeLimit: "3mb" },
  },
};

export default nextConfig;
