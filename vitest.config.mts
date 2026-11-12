import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    // `new URL` rather than a hand-joined path: correct on Windows, and needs no
    // `import.meta.dirname` (Node 20.11+) or `__dirname` (ESM-illegal).
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
