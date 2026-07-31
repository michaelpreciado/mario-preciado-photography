#!/usr/bin/env node
/**
 * build-fonts.mjs — copy the latin-subset woff2 files out of the @fontsource
 * packages into assets/fonts/, so the site self-hosts its type.
 *
 *   npm install && npm run fonts
 *
 * Self-hosting rather than linking Google Fonts removes two preconnects and a
 * render-blocking third-party request, and means the site has no external
 * dependencies at all. Only the `latin` subsets are copied — latin-ext,
 * cyrillic and greek are dropped, which is most of the weight.
 *
 * @font-face rules are hand-written in css/style.css, not imported from the
 * packages, so the unicode-range and font-display stay under our control.
 */

import { copyFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'assets', 'fonts');

const FONTS = [
  { role: 'display', pkg: '@fontsource/anton', file: 'anton-latin-400-normal.woff2' },
  { role: 'sans', pkg: '@fontsource-variable/inter', file: 'inter-latin-wght-normal.woff2' },
  { role: 'mono', pkg: '@fontsource-variable/jetbrains-mono', file: 'jetbrains-mono-latin-wght-normal.woff2' },
  { role: 'pixel', pkg: '@fontsource/silkscreen', file: 'silkscreen-latin-400-normal.woff2' },
];

const kb = (b) => `${(b / 1024).toFixed(0)}KB`;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  let total = 0;

  console.log('\n  Self-hosting fonts (latin subset only)\n');

  for (const { role, pkg, file } of FONTS) {
    const src = path.join(ROOT, 'node_modules', pkg, 'files', file);
    const dest = path.join(OUT_DIR, file);
    try {
      await copyFile(src, dest);
    } catch {
      console.error(`  ✗ ${file} — not found. Did you run \`npm install\`?`);
      process.exit(1);
    }
    const bytes = (await stat(dest)).size;
    total += bytes;
    console.log(`  ${role.padEnd(9)} ${file.padEnd(42)} ${kb(bytes)}`);
  }

  console.log(`\n  ${'─'.repeat(62)}`);
  console.log(`  total  ${kb(total)}  one-time, cached, replaces a blocking Google Fonts request`);
  console.log(`  → preload display + sans only; mono and pixel use font-display: swap\n`);
}

main().catch((err) => {
  console.error('\n✗ build-fonts failed:', err.message);
  process.exit(1);
});
