// registry/__tests__/batch2-registry-integrity.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const registryRoot = resolve(__dirname, "..");
const batch2Components = ["dropdown", "combobox", "listbox", "listview", "searchbox"];

describe("Batch 2 registry integrity", () => {
  const index = JSON.parse(
    readFileSync(resolve(registryRoot, "index.json"), "utf-8")
  );

  it("index.json contains all Batch 2 components", () => {
    const indexNames = index.components.map(
      (c: { name: string }) => c.name
    );
    for (const name of batch2Components) {
      expect(indexNames).toContain(name);
    }
  });

  for (const name of batch2Components) {
    describe(`${name} component`, () => {
      const metadataPath = resolve(registryRoot, `components/${name}.json`);

      it("has a component metadata JSON file", () => {
        expect(existsSync(metadataPath)).toBe(true);
      });

      it("all referenced files exist on disk", () => {
        const metadata = JSON.parse(readFileSync(metadataPath, "utf-8"));

        // CSS 파일 존재 확인
        for (const cssFile of metadata.css) {
          expect(existsSync(resolve(registryRoot, cssFile))).toBe(true);
        }

        // 프레임워크별 소스 파일 존재 확인
        for (const framework of ["react", "svelte", "vue"]) {
          for (const variant of ["ts", "js"]) {
            for (const file of metadata.files[framework][variant]) {
              expect(existsSync(resolve(registryRoot, file))).toBe(true);
            }
          }
        }
      });

      it("metadata name matches directory name", () => {
        const metadata = JSON.parse(readFileSync(metadataPath, "utf-8"));
        expect(metadata.name).toBe(name);
      });

      it("has a displayName and description", () => {
        const metadata = JSON.parse(readFileSync(metadataPath, "utf-8"));
        expect(metadata.displayName).toBeTruthy();
        expect(metadata.description).toBeTruthy();
      });
    });
  }
});
