import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/:channel([a-z0-9])", destination: "/?utm_source=heycatch&utm_campaign=:channel", statusCode: 302 }];
  },
};

export default nextConfig;
