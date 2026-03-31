import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";

describe("add command", () => {
  let tmpDir: string;
  let registryDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "win7ui-test-add-"));

    // Create win7ui.config.json
    await fs.writeJson(path.join(tmpDir, "win7ui.config.json"), {
      framework: "react",
      typescript: true,
      componentDir: "src/components/win7ui",
      cssDir: "src/components/win7ui/css",
    });

    // Setup a mock registry
    registryDir = path.join(tmpDir, "__registry__");

    // base.css
    await fs.ensureDir(path.join(registryDir, "css"));
    await fs.writeFile(
      path.join(registryDir, "css", "base.css"),
      "a{color:#06c;text-decoration:none}"
    );

    // button.css
    await fs.writeFile(
      path.join(registryDir, "css", "button.css"),
      "[role=button],button{background:linear-gradient(#f2f2f2 45%,#ebebeb 0,#cfcfcf)}"
    );

    // index.json
    await fs.writeJson(path.join(registryDir, "index.json"), {
      registryVersion: "1.0.0",
      minCliVersion: "0.1.0",
      maxCliVersion: "0.x.x",
      base: { css: ["css/base.css"] },
      components: [
        {
          name: "button",
          displayName: "Button",
          description: "Windows 7 button",
          dependencies: [],
        },
      ],
    });

    // component JSON
    await fs.ensureDir(path.join(registryDir, "components"));
    await fs.writeJson(path.join(registryDir, "components", "button.json"), {
      name: "button",
      displayName: "Button",
      description: "Windows 7 button",
      dependencies: [],
      css: ["css/button.css"],
      files: {
        react: {
          ts: ["react/button/button.tsx"],
          js: ["react/button/button.jsx"],
        },
        svelte: { ts: [], js: [] },
        vue: { ts: [], js: [] },
      },
    });

    // React TS source
    await fs.ensureDir(path.join(registryDir, "react", "button"));
    await fs.writeFile(
      path.join(registryDir, "react", "button", "button.tsx"),
      'import React from "react";\nexport function Button() { return <button>Click</button>; }\n'
    );
    await fs.writeFile(
      path.join(registryDir, "react", "button", "button.jsx"),
      'import React from "react";\nexport function Button() { return <button>Click</button>; }\n'
    );
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("should copy component files and CSS to target directory", async () => {
    const { runAdd } = await import("../add.js");

    await runAdd({
      cwd: tmpDir,
      components: ["button"],
      registryPath: registryDir,
      overwrite: false,
      nonInteractive: true,
    });

    // Component file should exist
    const componentPath = path.join(
      tmpDir,
      "src/components/win7ui",
      "Button.tsx"
    );
    expect(await fs.pathExists(componentPath)).toBe(true);

    // CSS module file should exist
    const cssPath = path.join(
      tmpDir,
      "src/components/win7ui/css",
      "button.module.css"
    );
    expect(await fs.pathExists(cssPath)).toBe(true);

    // base.css should be auto-installed
    const baseCssPath = path.join(
      tmpDir,
      "src/components/win7ui/css",
      "base.css"
    );
    expect(await fs.pathExists(baseCssPath)).toBe(true);
  });

  it("should create barrel file (index.ts)", async () => {
    const { runAdd } = await import("../add.js");

    await runAdd({
      cwd: tmpDir,
      components: ["button"],
      registryPath: registryDir,
      overwrite: false,
      nonInteractive: true,
    });

    const barrelPath = path.join(
      tmpDir,
      "src/components/win7ui",
      "index.ts"
    );
    expect(await fs.pathExists(barrelPath)).toBe(true);

    const content = await fs.readFile(barrelPath, "utf-8");
    expect(content).toContain('export { Button } from "./Button"');
  });

  it("should skip already installed component", async () => {
    const { runAdd } = await import("../add.js");

    // First install
    await runAdd({
      cwd: tmpDir,
      components: ["button"],
      registryPath: registryDir,
      overwrite: false,
      nonInteractive: true,
    });

    // Second install should not throw
    await runAdd({
      cwd: tmpDir,
      components: ["button"],
      registryPath: registryDir,
      overwrite: false,
      nonInteractive: true,
    });

    // File should still exist
    const componentPath = path.join(
      tmpDir,
      "src/components/win7ui",
      "Button.tsx"
    );
    expect(await fs.pathExists(componentPath)).toBe(true);
  });

  it("should throw if config not found", async () => {
    await fs.remove(path.join(tmpDir, "win7ui.config.json"));

    const { runAdd } = await import("../add.js");

    await expect(
      runAdd({
        cwd: tmpDir,
        components: ["button"],
        registryPath: registryDir,
        overwrite: false,
        nonInteractive: true,
      })
    ).rejects.toThrow();
  });
});
