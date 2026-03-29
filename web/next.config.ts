import type { NextConfig } from "next";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

function loadVersionString(): string {
  const p = path.join(process.cwd(), "version.json");
  let raw = fs.readFileSync(p, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const j = JSON.parse(raw) as {
    major: number;
    minor: number;
    patch: number;
  };
  const major = Number(j.major);
  const minor = Number(j.minor);
  const patch = Number(j.patch);
  if (!Number.isInteger(major) || major < 0) {
    throw new Error("version.json: invalid major");
  }
  if (!Number.isInteger(minor) || minor < 0 || minor > 9) {
    throw new Error("version.json: minor must be 0-9");
  }
  if (!Number.isInteger(patch) || patch < 0 || patch > 9) {
    throw new Error("version.json: patch must be 0-9");
  }
  return `${major}.${minor}.${patch}`;
}

function gitShaShort(): string {
  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

const gh = process.env.GITHUB_SHA;
const sha =
  typeof gh === "string" && gh.length >= 7 ? gh.slice(0, 7) : gitShaShort();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: loadVersionString(),
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_GIT_SHA: sha,
  },
  serverExternalPackages: ["firebase-admin"],
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
