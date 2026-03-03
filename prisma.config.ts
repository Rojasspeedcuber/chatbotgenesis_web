// prisma.config.ts
import { defineConfig } from "prisma/config";

// Load dotenv only if available (not needed during docker build)
try {
  require("dotenv/config");
} catch {
  // dotenv not available, skip
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use a placeholder during build, real URL at runtime
    url: process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});