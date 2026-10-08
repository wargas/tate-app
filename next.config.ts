import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: `standalone`,
  env: {
    NEXT_PUBLIC_BUILD_DATE: new Date().toJSON()
  }
  /* config options here */
};

export default nextConfig;
