import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Firebase App Hosting / container: adapter standalone çıktısı bekler */
  output: "standalone",
  /**
   * Monorepo: üst dizinde ikinci package-lock varken Turbopack kökünü uygulama dizinine sabitle
   * (build çalışma dizini her zaman `web/` olmalı)
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory
   */
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
