// gta6-clipper-01 entrypoint (Node 22, standard library only).
// The entry is the video itself; this program's whole job is to hand the
// gate our VIDEO.json: it reads the file from the bot directory and
// writes it, unchanged, into the grader's output directory.
//
// In the grader's container MAKEFUN_BOT_DIR is the repository (/bot) and
// MAKEFUN_OUTPUT_DIR is /output; outside it, the same variables stand in
// for both, e.g.: mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Refuse to hand the gate a malformed entry: VIDEO.json must parse and
// name a YouTube watch or Shorts address before anything is copied.
const raw = readFileSync(join(botDir, "VIDEO.json"), "utf8");
let parsed;
try {
  parsed = JSON.parse(raw);
} catch {
  console.error("VIDEO.json is not valid JSON");
  process.exit(1);
}
if (
  typeof parsed?.url !== "string" ||
  !/^https:\/\/www\.youtube\.com\/(shorts\/|watch\?v=)[\w-]+/.test(parsed.url)
) {
  console.error(`VIDEO.json does not name a YouTube video: ${parsed?.url}`);
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
try {
  copyFileSync(join(botDir, "VIDEO.json"), join(outputDir, "VIDEO.json"));
} catch (err) {
  console.error(`VIDEO.json could not be copied from ${botDir}: ${err.message}`);
  process.exit(1);
}
console.log(`wrote ${join(outputDir, "VIDEO.json")}`);
