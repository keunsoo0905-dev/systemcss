import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";

describe("E2E: init -> add -> list -> remove", () => {
  let tmpDir: string;
  let registryDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "win7ui-e2e-"));

    // Simulate user project with React
    await fs.writeJson(path.join(tmpDir, "package.json"), {
      name: "test-project",
      dependencies: { react: "^18.0.0", "react-dom": "^18.0.0" },
    });

    // Use real registry from project
    registryDir = path.resolve(__dirname, "../../../../registry");
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("full workflow: init -> add button -> add textbox -> list -> remove button -> list", async () => {
    // ---- Step 1: init ----
    const { runInit } = await import("../commands/init.js");
    await runInit({
      cwd: tmpDir,
      framework: "react",
      typescript: true,
      componentDir: undefined,
      cssDir: undefined,
      nonInteractive: true,
    });

    // Verify config created
    const config = await fs.readJson(path.join(tmpDir, "win7ui.config.json"));
    expect(config.framework).toBe("react");
    expect(config.typescript).toBe(true);

    // ---- Step 2: add button ----
    const { runAdd } = await import("../commands/add.js");
    await runAdd({
      cwd: tmpDir,
      components: ["button"],
      registryPath: registryDir,
      overwrite: false,
      nonInteractive: true,
    });

    // Verify button installed
    const buttonPath = path.join(tmpDir, "src/components/win7ui", "Button.tsx");
    expect(await fs.pathExists(buttonPath)).toBe(true);

    const buttonCssPath = path.join(
      tmpDir,
      "src/components/win7ui/css",
      "button.module.css"
    );
    expect(await fs.pathExists(buttonCssPath)).toBe(true);

    const baseCssPath = path.join(
      tmpDir,
      "src/components/win7ui/css",
      "base.css"
    );
    expect(await fs.pathExists(baseCssPath)).toBe(true);

    // ---- Step 3: add textbox ----
    await runAdd({
      cwd: tmpDir,
      components: ["textbox"],
      registryPath: registryDir,
      overwrite: false,
      nonInteractive: true,
    });

    const textboxPath = path.join(
      tmpDir,
      "src/components/win7ui",
      "Textbox.tsx"
    );
    expect(await fs.pathExists(textboxPath)).toBe(true);

    // ---- Step 4: list ----
    const { runList } = await import("../commands/list.js");
    const listResult = await runList({
      cwd: tmpDir,
      registryPath: registryDir,
    });

    const buttonStatus = listResult.find((c) => c.name === "button");
    expect(buttonStatus?.installed).toBe(true);

    const textboxStatus = listResult.find((c) => c.name === "textbox");
    expect(textboxStatus?.installed).toBe(true);

    // Verify barrel file contains both
    const barrelPath = path.join(
      tmpDir,
      "src/components/win7ui",
      "index.ts"
    );
    const barrelContent = await fs.readFile(barrelPath, "utf-8");
    expect(barrelContent).toContain("Button");
    expect(barrelContent).toContain("Textbox");

    // ---- Step 5: remove button ----
    const { runRemove } = await import("../commands/remove.js");
    await runRemove({
      cwd: tmpDir,
      components: ["button"],
      force: false,
      nonInteractive: true,
    });

    // Verify button removed
    expect(await fs.pathExists(buttonPath)).toBe(false);
    expect(await fs.pathExists(buttonCssPath)).toBe(false);

    // Verify textbox still exists
    expect(await fs.pathExists(textboxPath)).toBe(true);

    // ---- Step 6: list after removal ----
    const listResult2 = await runList({
      cwd: tmpDir,
      registryPath: registryDir,
    });

    const buttonStatus2 = listResult2.find((c) => c.name === "button");
    expect(buttonStatus2?.installed).toBe(false);

    const textboxStatus2 = listResult2.find((c) => c.name === "textbox");
    expect(textboxStatus2?.installed).toBe(true);

    // Verify barrel file updated
    const barrelContent2 = await fs.readFile(barrelPath, "utf-8");
    expect(barrelContent2).not.toContain("Button");
    expect(barrelContent2).toContain("Textbox");
  });

  it("should handle Svelte framework", async () => {
    const { runInit } = await import("../commands/init.js");
    await runInit({
      cwd: tmpDir,
      framework: "svelte",
      typescript: true,
      componentDir: undefined,
      cssDir: undefined,
      nonInteractive: true,
    });

    const { runAdd } = await import("../commands/add.js");
    await runAdd({
      cwd: tmpDir,
      components: ["button"],
      registryPath: registryDir,
      overwrite: false,
      nonInteractive: true,
    });

    // Svelte TS component: Button.svelte
    const svelteButtonPath = path.join(
      tmpDir,
      "src/components/win7ui",
      "Button.svelte"
    );
    expect(await fs.pathExists(svelteButtonPath)).toBe(true);

    // Svelte does NOT have separate CSS module files (CSS is in <style>)
    // base.css is still installed
    const baseCssPath = path.join(
      tmpDir,
      "src/components/win7ui/css",
      "base.css"
    );
    expect(await fs.pathExists(baseCssPath)).toBe(true);
  });

  it("should handle Vue framework with JavaScript", async () => {
    const { runInit } = await import("../commands/init.js");
    await runInit({
      cwd: tmpDir,
      framework: "vue",
      typescript: false,
      componentDir: undefined,
      cssDir: undefined,
      nonInteractive: true,
    });

    const { runAdd } = await import("../commands/add.js");
    await runAdd({
      cwd: tmpDir,
      components: ["checkbox"],
      registryPath: registryDir,
      overwrite: false,
      nonInteractive: true,
    });

    // Vue JS component: Checkbox.js.vue
    const vueCheckboxPath = path.join(
      tmpDir,
      "src/components/win7ui",
      "Checkbox.js.vue"
    );
    expect(await fs.pathExists(vueCheckboxPath)).toBe(true);
  });

  it("should add multiple components at once", async () => {
    const { runInit } = await import("../commands/init.js");
    await runInit({
      cwd: tmpDir,
      framework: "react",
      typescript: true,
      componentDir: undefined,
      cssDir: undefined,
      nonInteractive: true,
    });

    const { runAdd } = await import("../commands/add.js");
    await runAdd({
      cwd: tmpDir,
      components: ["button", "textbox", "checkbox", "radiobutton", "groupbox"],
      registryPath: registryDir,
      overwrite: false,
      nonInteractive: true,
    });

    // All 5 components should be installed
    const componentDir = path.join(tmpDir, "src/components/win7ui");
    expect(await fs.pathExists(path.join(componentDir, "Button.tsx"))).toBe(true);
    expect(await fs.pathExists(path.join(componentDir, "Textbox.tsx"))).toBe(true);
    expect(await fs.pathExists(path.join(componentDir, "Checkbox.tsx"))).toBe(true);
    expect(await fs.pathExists(path.join(componentDir, "Radiobutton.tsx"))).toBe(true);
    expect(await fs.pathExists(path.join(componentDir, "Groupbox.tsx"))).toBe(true);

    // Barrel file should contain all 5
    const barrelContent = await fs.readFile(
      path.join(componentDir, "index.ts"),
      "utf-8"
    );
    expect(barrelContent).toContain("Button");
    expect(barrelContent).toContain("Textbox");
    expect(barrelContent).toContain("Checkbox");
    expect(barrelContent).toContain("Radiobutton");
    expect(barrelContent).toContain("Groupbox");
  });
});
