import sharp from 'sharp';
import { readdir, stat, unlink, rename } from 'fs/promises';
import { join } from 'path';

const PUBLIC_IMG = 'public/images';
const THUMB_WIDTH = 400;

async function getPreviewFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) files.push(...await getPreviewFiles(full));
    else if (e.name.includes('_preview.webp')) files.push(full);
  }
  return files;
}

async function optimizeThumbnails() {
  const files = await getPreviewFiles(PUBLIC_IMG);
  let saved = 0;
  let totalSaved = 0;

  const { writeFile } = await import('fs/promises');
  for (const file of files) {
    try {
      const meta = await sharp(file).metadata();
      if (meta.width <= THUMB_WIDTH) continue;
      const before = (await stat(file)).size;
      const buf = await sharp(file).resize(THUMB_WIDTH).webp({ quality: 75 }).toBuffer();
      if (buf.length < before) {
        await writeFile(file, buf);
        totalSaved += before - buf.length;
        saved++;
      }
    } catch (err) {
      console.warn(`  SKIP (locked): ${file}`);
    }
  }

  console.log(`Resized ${saved} thumbnails`);
  console.log(`Saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
}

await optimizeThumbnails();
