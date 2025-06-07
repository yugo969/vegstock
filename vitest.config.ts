/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
  css: {
    postcss: {}, // PostCSS処理を最小限に
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
