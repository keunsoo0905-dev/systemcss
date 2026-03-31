import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [react(), svelte(), vue()],
  test: {
    environment: "jsdom",
    include: ["registry/**/*.test.{ts,tsx}"],
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    css: {
      modules: {
        classNameStrategy: "non-scoped",
      },
    },
  },
});
