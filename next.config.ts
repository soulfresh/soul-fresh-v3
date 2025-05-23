import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  sassOptions: {
    includePaths: ["./src/style"],
  },
};

export default nextConfig;
