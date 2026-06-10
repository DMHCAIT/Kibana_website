/**
 * Converts every .png in /public to .webp (quality 82) and deletes the
 * original PNG when the conversion saves space. Skips favicons.
 *
 * Run: npx tsx scripts/convert-to-webp.ts
 */
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const SKIP = new Set(["favicon-16x16.png"]);

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function main() {
  let totalBefore = 0;
  let totalAfter = 0;
  let count = 0;

  for await (const file of walk(PUBLIC_DIR)) {
    if (!file.toLowerCase().endsWith(".png")) continue;
    if (SKIP.has(path.basename(file))) continue;

    const webpPath = file.slice(0, -4) + ".webp";
    const before = (await stat(file)).size;

    await sharp(file).webp({ quality: 82, effort: 5 }).toFile(webpPath);

    const after = (await stat(webpPath)).size;
    totalBefore += before;
    totalAfter += after;
    count++;

    await unlink(file);
    console.log(
      `${path.relative(PUBLIC_DIR, file)}  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`,
    );
  }

  console.log(
    `\nDone. ${count} files converted: ${(totalBefore / 1048576).toFixed(1)}MB -> ${(totalAfter / 1048576).toFixed(1)}MB`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
