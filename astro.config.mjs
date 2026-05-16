// @ts-check
import { defineConfig } from 'astro/config';
import { rehypeImgAttrs } from './rehype-img-attrs.mjs';

export default defineConfig({
  site: 'https://khozai.netlify.app',
  compressHTML: true,
  markdown: {
    gfm: true,
    rehypePlugins: [rehypeImgAttrs],
  },
});
