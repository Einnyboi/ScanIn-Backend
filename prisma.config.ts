import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  migrations: {
    // Seed script for `prisma db seed` — runs the node seed file
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
