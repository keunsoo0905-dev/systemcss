import { afterEach } from "vitest";
import { cleanup as reactCleanup } from "@testing-library/react";
import { cleanup as svelteCleanup } from "@testing-library/svelte";
import { cleanup as vueCleanup } from "@testing-library/vue";
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  reactCleanup();
  svelteCleanup();
  vueCleanup();
});
