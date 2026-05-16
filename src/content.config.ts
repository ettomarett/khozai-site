import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const chapters = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/chapters' }),
  schema: z.object({
    title: z.string(),
    shortTitle: z.string(),
    order: z.number(),
    part: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { chapters };
