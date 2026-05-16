import sharp from 'sharp';
import { readdir, stat, unlink, readFile, writeFile } from 'fs/promises';
import { join, extname } from 'path';

const PUBLIC_IMG = 'public/images';
const CONTENT_DIR = 'src/content/chapters';

async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) files.push(...await getFiles(full));
    else if (extname(e.name).toLowerCase() === '.png') files.push(full);
    else if (extname(e.name).toLowerCase() === '.jpg') files.push(full);
  }
  return files;
}

async function convertImages() {
  const files = await getFiles(PUBLIC_IMG);
  let totalBefore = 0;
  let totalAfter = 0;
  let count = 0;

  for (const file of files) {
    const before = (await stat(file)).size;
    totalBefore += before;

    const outFile = file.replace(/\.(png|jpg)$/i, '.webp');
    try {
      await sharp(file)
        .webp({ quality: 82 })
        .toFile(outFile);

      const after = (await stat(outFile)).size;
      totalAfter += after;
      await unlink(file);
      count++;
    } catch (err) {
      console.error(`  SKIP ${file}: ${err.message}`);
    }
  }

  console.log(`Converted ${count} images`);
  console.log(`Before: ${(totalBefore / 1024 / 1024).toFixed(1)} MB`);
  console.log(`After:  ${(totalAfter / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Saved:  ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(1)} MB`);
}

async function updateMarkdown() {
  const files = await readdir(CONTENT_DIR);
  let updated = 0;
  for (const f of files) {
    if (!f.endsWith('.md')) continue;
    const path = join(CONTENT_DIR, f);
    let content = await readFile(path, 'utf-8');
    const original = content;
    content = content.replace(/\.png\)/g, '.webp)');
    content = content.replace(/\.jpg\)/g, '.webp)');
    if (content !== original) {
      await writeFile(path, content, 'utf-8');
      updated++;
    }
  }
  console.log(`Updated ${updated} markdown files`);
}

await convertImages();
await updateMarkdown();
console.log('DONE');
