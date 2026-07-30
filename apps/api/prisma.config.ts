import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Local settings take precedence, while .env remains a convenient fallback.
config({ path: ".env.local", override: true });
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma CLI commands (migrate, db pull, Studio) must bypass PgBouncer.
    url: env("DIRECT_URL"),
  },
});