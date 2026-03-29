import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const versionPath = path.join(root, "version.json");

const skip = process.env.SKIP_VERSION_BUMP;
if (skip === "1" || skip === "true") {
  console.log("[bump-version] SKIP_VERSION_BUMP set, skipping");
  process.exit(0);
}

function assertPart(name, n, max) {
  if (!Number.isInteger(n) || n < 0 || (max !== undefined && n > max)) {
    throw new Error(`version.json: invalid ${name} (expected 0..${max ?? "infinity"})`);
  }
}

let raw = fs.readFileSync(versionPath, "utf8");
if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
const data = JSON.parse(raw);
let major = Number(data.major);
let minor = Number(data.minor);
let patch = Number(data.patch);

assertPart("major", major);
assertPart("minor", minor, 9);
assertPart("patch", patch, 9);

patch += 1;
if (patch > 9) {
  patch = 0;
  minor += 1;
  if (minor > 9) {
    minor = 0;
    major += 1;
  }
}

const next = { major, minor, patch };
fs.writeFileSync(versionPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
console.log(`[bump-version] ${major}.${minor}.${patch}`);
