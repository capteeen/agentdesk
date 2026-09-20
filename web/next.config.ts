import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@solana/wallet-adapter-base", "@solana/wallet-adapter-react", "@solana/web3.js"],
};

export default nextConfig;
