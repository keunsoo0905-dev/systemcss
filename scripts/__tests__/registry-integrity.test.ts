// @vitest-environment node
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve, join } from "path";

const REGISTRY_ROOT = resolve(__dirname, "../../registry");

function readJson(filePath: string) {
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

// 전체 22개 컴포넌트 목록
const ALL_COMPONENTS = [
  // Batch 1
  "button", "textbox", "checkbox", "radiobutton", "groupbox",
  // Batch 2
  "dropdown", "combobox", "listbox", "listview", "searchbox",
  // Batch 3
  "tabs", "menu", "menubar", "collapse", "progressbar",
  // Batch 4
  "slider", "spinner", "treeview",
  // Batch 5
  "window", "scrollbar", "balloon", "typography",
];

const FRAMEWORKS = ["react", "svelte", "vue"];

describe("Registry integrity", () => {
  it("index.json contains all 22 components", () => {
    const index = readJson(join(REGISTRY_ROOT, "index.json"));
    const names = index.components.map((c: { name: string }) => c.name);
    for (const comp of ALL_COMPONENTS) {
      expect(names).toContain(comp);
    }
    expect(names.length).toBe(22);
  });

  it("each component has a valid JSON metadata file", () => {
    for (const comp of ALL_COMPONENTS) {
      const jsonPath = join(REGISTRY_ROOT, "components", `${comp}.json`);
      expect(existsSync(jsonPath)).toBe(true);
      const meta = readJson(jsonPath);
      expect(meta.name).toBe(comp);
      expect(meta.css).toBeDefined();
      expect(meta.files).toBeDefined();
    }
  });

  it("all CSS files referenced in metadata exist", () => {
    for (const comp of ALL_COMPONENTS) {
      const meta = readJson(
        join(REGISTRY_ROOT, "components", `${comp}.json`)
      );
      for (const cssFile of meta.css) {
        const cssPath = join(REGISTRY_ROOT, cssFile);
        expect(existsSync(cssPath)).toBe(true);
      }
    }
  });

  it("all framework source files referenced in metadata exist", () => {
    for (const comp of ALL_COMPONENTS) {
      const meta = readJson(
        join(REGISTRY_ROOT, "components", `${comp}.json`)
      );
      for (const framework of FRAMEWORKS) {
        if (!meta.files[framework]) continue;
        for (const variant of ["ts", "js"]) {
          if (!meta.files[framework][variant]) continue;
          for (const file of meta.files[framework][variant]) {
            const filePath = join(REGISTRY_ROOT, file);
            expect(
              existsSync(filePath),
              `Missing: ${filePath}`
            ).toBe(true);
          }
        }
      }
    }
  });

  it("base.css exists", () => {
    const baseCssPath = join(REGISTRY_ROOT, "css", "base.css");
    expect(existsSync(baseCssPath)).toBe(true);
  });
});
