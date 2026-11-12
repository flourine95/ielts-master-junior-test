import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Tests never touch the developer's .data/ielts.db: every worker gets its own
    // freshly seeded in-memory database.
    env: { IELTS_DB_PATH: ":memory:" },
  },
  resolve: {
    alias: {
      "@": import.meta.dirname + "/src",
    },
  },
});
