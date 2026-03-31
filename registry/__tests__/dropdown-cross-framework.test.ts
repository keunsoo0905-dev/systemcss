// registry/__tests__/dropdown-cross-framework.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("Dropdown cross-framework consistency", () => {
  const registryRoot = resolve(__dirname, "..");
  const metadata = JSON.parse(
    readFileSync(resolve(registryRoot, "components/dropdown.json"), "utf-8")
  );

  it("metadata references all framework files", () => {
    expect(metadata.files.react.ts).toContain("react/dropdown/dropdown.tsx");
    expect(metadata.files.react.js).toContain("react/dropdown/dropdown.jsx");
    expect(metadata.files.svelte.ts).toContain("svelte/dropdown/Dropdown.svelte");
    expect(metadata.files.svelte.js).toContain("svelte/dropdown/Dropdown.js.svelte");
    expect(metadata.files.vue.ts).toContain("vue/dropdown/Dropdown.vue");
    expect(metadata.files.vue.js).toContain("vue/dropdown/Dropdown.js.vue");
  });

  it("all referenced files exist on disk", () => {
    const allFiles = [
      ...metadata.files.react.ts,
      ...metadata.files.react.js,
      ...metadata.files.svelte.ts,
      ...metadata.files.svelte.js,
      ...metadata.files.vue.ts,
      ...metadata.files.vue.js,
    ];
    for (const file of allFiles) {
      const fullPath = resolve(registryRoot, file);
      expect(() => readFileSync(fullPath)).not.toThrow();
    }
  });

  it("CSS file referenced in metadata exists", () => {
    for (const cssFile of metadata.css) {
      const fullPath = resolve(registryRoot, cssFile);
      expect(() => readFileSync(fullPath)).not.toThrow();
    }
  });
});
