import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["exceljs", "pdf-lib", "bcryptjs", "@aws-sdk/client-s3"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
