import { defineConfig } from "drizzle-kit";

// Reads DATABASE_URL from .env — see .env.example for the stub.
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — copy .env.example to .env and fill it in.");
}

export default defineConfig({
  schema: "./src/database/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
