import { afterEach } from "vitest";
import { cleanup as reactCleanup } from "@testing-library/react";
import { cleanup as svelteCleanup } from "@testing-library/svelte";
import { cleanup as vueCleanup } from "@testing-library/vue";

afterEach(() => {
  reactCleanup();
  svelteCleanup();
  vueCleanup();
});
