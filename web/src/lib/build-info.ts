export type BuildInfo = {
  version: string;
  buildTime: string;
  gitSha: string;
};

export function getBuildInfo(): BuildInfo {
  return {
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "",
    buildTime: process.env.NEXT_PUBLIC_BUILD_TIME ?? "",
    gitSha: process.env.NEXT_PUBLIC_GIT_SHA ?? "",
  };
}

export function formatVersionLabel(version: string): string {
  return version ? `v${version}` : "v—";
}
