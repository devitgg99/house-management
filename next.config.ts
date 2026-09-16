import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output only for Docker deployment (disabled on Vercel to avoid NFT trace file conflicts)
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
};

export default nextConfig;
