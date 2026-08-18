import "dotenv/config"; // loads .env
import { config as loadEnvLocal } from "dotenv";
loadEnvLocal({ path: ".env.local", override: true }); // Vercel-managed values win when present

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Direct (unpooled) connection required for migrations/DDL against Neon.
    url: process.env["DATABASE_URL_UNPOOLED"] ?? process.env["DATABASE_URL"],
  },
});
