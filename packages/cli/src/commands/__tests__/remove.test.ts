import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";

describe("remove command", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "win7ui-test-remove-"));

    // Create config
    await fs.writeJson(path.join(tmpDir, "win7ui.config.json"), {
      framework: "react",
      typescript: true,
      componentDir: "src/components/win7ui",
      cssDir: "src/components/win7ui/css",
    });

    // Simulate installed components
    const componentDir = path.join(tmpDir, "src/components/win7ui");
    const cssDir = path.join(tmpDir, "src/components/win7ui/css");
    await fs.ensureDir(componentDir);
    await fs.ensureDir(cssDir);

    await fs.writeFile(
      path.join(componentDir, "Button.tsx"),
      'export function Button() { return <button>Click</button>; }\n'
    );
    await fs.writeFile(
      path.join(componentDir, "Textbox.tsx"),
      'export function Textbox() { return <input />; }\n'
    );
    await fs.writeFile(
      path.join(cssDir, "button.module.css"),
      "button{color:red}"
    );
    await fs.writeFile(
      path.join(cssDir, "textbox.module.css"),
      "input{color:blue}"
    );
    await fs.writeFile(
      path.join(componentDir, "index.ts"),
      'export { Button } from "./Button";\nexport { Textbox } from "./Textbox";\n'
    );
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("should remove component file and CSS", async () => {
    const { runRemove } = await import("../remove.js");

    await runRemove({
      cwd: tmpDir,
      components: ["button"],
      force: false,
      nonInteractive: true,
    });

    const componentPath = path.join(
      tmpDir,
      "src/components/win7ui",
      "Button.tsx"
    );
    const cssPath = path.join(
      tmpDir,
      "src/components/win7ui/css",
      "button.module.css"
    );

    expect(await fs.pathExists(componentPath)).toBe(false);
    expect(await fs.pathExists(cssPath)).toBe(false);
  });

  it("should update barrel file after removal", async () => {
    const { runRemove } = await import("../remove.js");

    await runRemove({
      cwd: tmpDir,
      components: ["button"],
      force: false,
      nonInteractive: true,
    });

    const barrelPath = path.join(
      tmpDir,
      "src/components/win7ui",
      "index.ts"
    );
    const content = await fs.readFile(barrelPath, "utf-8");

    expect(content).not.toContain("Button");
    expect(content).toContain("Textbox");
  });

  it("should handle removing non-existent component gracefully", async () => {
    const { runRemove } = await import("../remove.js");

    // Should not throw
    await runRemove({
      cwd: tmpDir,
      components: ["nonexistent"],
      force: false,
      nonInteractive: true,
    });
  });

  it("should throw if config not found", async () => {
    await fs.remove(path.join(tmpDir, "win7ui.config.json"));

    const { runRemove } = await import("../remove.js");

    await expect(
      runRemove({
        cwd: tmpDir,
        components: ["button"],
        force: false,
        nonInteractive: true,
      })
    ).rejects.toThrow();
  });
});
