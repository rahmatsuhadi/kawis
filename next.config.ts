import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 async rewrites() {
    return[
      {
        source: "/api/reverse",
        destination: "http://nominatim.openstreetmap.org/reverse"
      }

    ]
  },
  /* config options here */
  images:{
    remotePatterns: [new URL("https://uiumgmozjxuneskclpzp.supabase.co/**")]
  }
};

export default nextConfig;
