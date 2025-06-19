import type { NextConfig } from "next";
import { webpack } from "next/dist/compiled/webpack/webpack";

const nextConfig: NextConfig = {
  webpack: (config, {buildId, dev, isServer, defaultLoaders, webpack}) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    return config
  }
};

export default nextConfig;
