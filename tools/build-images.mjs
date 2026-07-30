#!/usr/bin/env node
/**
 * build-images.mjs — one-off responsive image pipeline.
 *
 * The site itself has no build step: this script runs locally, its output is
 * committed, and the browser just gets static files. Re-run it whenever photos
 * are added or replaced.
 *
 *   npm install
 *   npm run images          # skips variants that already exist
 *   npm run images -- --force
 *
 * Emits, for every source photo in assets/images/*.webp:
 *   assets/images/opt/<name>-<width>.avif
 *   assets/images/opt/<name>-<width>.webp
 * and a single assets/images/manifest.json carrying real dimensions (the CLS
 * fix), the variant list, and a 24px base64 LQIP that doubles as the site's
 * pixelated 8-bit reveal.
 */

import sharp from 'sharp';
import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT, 'assets', 'images');
const OUT_DIR = path.join(SRC_DIR, 'opt');
const MANIFEST = path.join(SRC_DIR, 'manifest.json');

// 320 exists for the about-page contact strip: those boxes are ~100px wide, so
// even on a 3× phone they only need ~300px. Without it the browser jumps to the
// 480 (or worse, 960) variant for a thumbnail.
const WIDTHS = [320, 480, 960, 1440, 1920];
const LQIP_WIDTH = 24;
const FORCE = process.argv.includes('--force');

/**
 * Stage photography is shot at high ISO, so it carries real sensor grain and
 * compresses badly — the hero came out at 505KB at quality 50, which is not a
 * defensible LCP. Quality steps down as the variant gets wider: the big files
 * are only ever shown on large or high-DPR screens where the pixels are small
 * enough to hide the difference, while the small variants stay crisp.
 */
const avifOpts = (w) => ({ quality: w > 960 ? 42 : 44, effort: 4, chromaSubsampling: '4:2:0' });
const webpOpts = (w) => ({ quality: w > 960 ? 74 : 78, effort: 4 });

const kb = (b) => `${(b / 1024).toFixed(0)}KB`;
const pad = (s, n) => String(s).padEnd(n);

async function sizeOf(file) {
  try {
    return (await stat(file)).size;
  } catch {
    return 0;
  }
}

async function main() {
  if (!existsSync(SRC_DIR)) {
    console.error(`✗ No source directory at ${SRC_DIR}`);
    process.exit(1);
  }
  await mkdir(OUT_DIR, { recursive: true });

  const files = (await readdir(SRC_DIR))
    .filter((f) => /\.(webp|jpe?g|png)$/i.test(f))
    .sort();

  if (!files.length) {
    console.error(`✗ No source images found in ${SRC_DIR}`);
    process.exit(1);
  }

  console.log(`\n  Building responsive variants for ${files.length} photos`);
  console.log(`  widths: ${WIDTHS.join(' / ')}  ·  formats: avif + webp`);
  console.log(`  ${FORCE ? 'force rebuild' : 'skipping variants that already exist'}\n`);

  const manifest = {};
  const rows = [];
  let totalSrc = 0;
  let totalOut = 0;
  let totalMobile = 0;

  for (const file of files) {
    const name = path.parse(file).name;
    const srcPath = path.join(SRC_DIR, file);
    const image = sharp(srcPath);
    const meta = await image.metadata();
    const srcBytes = await sizeOf(srcPath);
    totalSrc += srcBytes;

    // Never upscale: cap the ladder at the source width. Then always include
    // the native width itself, otherwise a 1280px source would top out at the
    // 960 variant and go soft on a full-bleed desktop hero — unacceptable on a
    // photography site. Also guarantees a variant for the small originals
    // (several are under 1024px).
    const widths = [...new Set([...WIDTHS.filter((w) => w <= meta.width), meta.width])].sort((a, b) => a - b);

    process.stdout.write(`  ${pad(name, 18)} ${pad(`${meta.width}×${meta.height}`, 12)} `);

    const variants = [];
    let outBytes = 0;
    let mobileBytes = 0;

    for (const w of widths) {
      const avifPath = path.join(OUT_DIR, `${name}-${w}.avif`);
      const webpPath = path.join(OUT_DIR, `${name}-${w}.webp`);

      if (FORCE || !existsSync(avifPath)) {
        await sharp(srcPath).resize(w).avif(avifOpts(w)).toFile(avifPath);
      }
      if (FORCE || !existsSync(webpPath)) {
        await sharp(srcPath).resize(w).webp(webpOpts(w)).toFile(webpPath);
      }

      const a = await sizeOf(avifPath);
      outBytes = Math.max(outBytes, a); // widest variant = desktop worst case
      if (w === widths[0]) mobileBytes += a; // narrowest = what a phone fetches
      variants.push({ w, avif: `assets/images/opt/${name}-${w}.avif`, webp: `assets/images/opt/${name}-${w}.webp` });
      process.stdout.write('·');
    }

    // LQIP — deliberately tiny so it renders as visible 8-bit blocks under
    // `image-rendering: pixelated` before the real frame decodes.
    const lqipBuf = await sharp(srcPath)
      .resize(LQIP_WIDTH)
      .webp({ quality: 35, alphaQuality: 0, effort: 6 })
      .toBuffer();
    const lqip = `data:image/webp;base64,${lqipBuf.toString('base64')}`;

    totalOut += outBytes;
    totalMobile += mobileBytes;

    manifest[name] = {
      src: `assets/images/${file}`,
      width: meta.width,
      height: meta.height,
      aspect: +(meta.width / meta.height).toFixed(4),
      orientation: meta.width > meta.height ? 'landscape' : meta.width === meta.height ? 'square' : 'portrait',
      lqip,
      variants,
    };

    rows.push({ name, srcBytes, outBytes, n: variants.length, lqip: lqipBuf.length });
    console.log(
      `  ${pad(widths.join('/'), 20)} ${pad(kb(srcBytes), 7)} → ${pad(kb(outBytes), 7)} lqip ${lqipBuf.length}B`
    );
  }

  await writeFile(
    MANIFEST,
    JSON.stringify({ generated: 'run `npm run images` to regenerate', images: manifest }, null, 2) + '\n'
  );

  const pct = (n) => (totalSrc ? (((totalSrc - n) / totalSrc) * 100).toFixed(0) : '0');
  const oversized = rows.filter((r) => r.lqip > 1536);
  const lqipTotal = rows.reduce((a, r) => a + r.lqip, 0);

  console.log(`\n  ${'─'.repeat(64)}`);
  console.log(`  before — original webp, no srcset, every device   ${kb(totalSrc)}`);
  console.log(`  after  — phone fetches 480px avif                 ${kb(totalMobile)}   −${pct(totalMobile)}%`);
  console.log(`  after  — wide desktop fetches native-width avif   ${kb(totalOut)}   −${pct(totalOut)}%`);
  console.log(`  lqip   — inlined in manifest, blocks first paint  ${kb(lqipTotal)}`);
  console.log(`\n  manifest  assets/images/manifest.json`);
  if (oversized.length) {
    console.log(`\n  ⚠ LQIP over 1.5KB on: ${oversized.map((r) => r.name).join(', ')}`);
    console.log(`    These are inlined into the manifest — drop LQIP_WIDTH if this grows.`);
  }
  console.log('');
}

main().catch((err) => {
  console.error('\n✗ build-images failed:', err.message);
  process.exit(1);
});
