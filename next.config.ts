import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  // Files named `*.dev.tsx` / `*.dev.ts` (ex. `page.dev.tsx`) are only
  // routable during development. This keeps `src/app/experiments` out of production builds.
  pageExtensions: isProduction ? ["tsx", "ts"] : ["dev.tsx", "dev.ts", "tsx", "ts"],
  sassOptions: {
    includePaths: ["./src/style"],
  },
};

export default nextConfig;
