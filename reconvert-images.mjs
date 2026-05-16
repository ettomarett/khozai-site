import sharp from 'sharp';
import { readdir, stat, writeFile } from 'fs/promises';
import { join, extname, basename } from 'path';

const SOURCE = 'd:/Labomar/Khozai/khozai birth';
const DEST = 'public/images';
const QUALITY = 100;

const chapterDirs = [
  { src: 'introduction/images', dest: 'introduction' },
  { src: 'conclusion/images', dest: 'conclusion' },
  ...Array.from({ length: 13 }, (_, i) => {
    const ch = `ch${String(i + 1).padStart(2, '0')}`;
    return { src: `${ch}/images`, dest: ch };
  }),
];

async function getPngs(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory() && e.name !== 'backup_v1') {
        files.push(...await getPngs(full));
      } else if (extname(e.name).toLowerCase() === '.png') {
        files.push(full);
      }
    }
    return files;
  } catch { return []; }
}

async function run() {
  let converted = 0;
  let totalBefore = 0;
  let totalAfter = 0;

  for (const { src, dest } of chapterDirs) {
    const srcDir = join(SOURCE, src);
    const destDir = join(DEST, dest);
    const pngs = await getPngs(srcDir);

    for (const png of pngs) {
      const name = basename(png, '.png') + '.webp';
      const outPath = join(destDir, name);

      try {
        const before = (await stat(png)).size;
        totalBefore += before;

        const buf = await sharp(png).webp({ quality: QUALITY }).toBuffer();
        await writeFile(outPath, buf);
        totalAfter += buf.length;
        converted++;
      } catch (err) {
        console.warn(`  SKIP ${png}: ${err.message}`);
      }
    }
    process.stdout.write(`  ${dest}: ${pngs.length} images\n`);
  }

  console.log(`\nConverted ${converted} images at quality ${QUALITY}`);
  console.log(`Source PNGs: ${(totalBefore / 1024 / 1024).toFixed(1)} MB`);
  console.log(`WebP output: ${(totalAfter / 1024 / 1024).toFixed(1)} MB`);
}

await run();
