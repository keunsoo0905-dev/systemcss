import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";

describe("list command", () => {
  let tmpDir: string;
  let registryDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "win7ui-test-list-"));

    // Create config
    await fs.writeJson(path.join(tmpDir, "win7ui.config.json"), {
      framework: "react",
      typescript: true,
      componentDir: "src/components/win7ui",
      cssDir: "src/components/win7ui/css",
    });

    // Mock registry
    registryDir = path.join(tmpDir, "__registry__");
    await fs.ensureDir(registryDir);
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
        {
          name: "textbox",
          displayName: "TextBox",
          description: "Windows 7 textbox",
          dependencies: [],
        },
      ],
    });
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("should return all components with installed status", async () => {
    // Install button
    const componentDir = path.join(tmpDir, "src/components/win7ui");
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, "Button.tsx"),
      "export function Button() {}"
    );

    const { runList } = await import("../list.js");
    const result = await runList({
      cwd: tmpDir,
      registryPath: registryDir,
    });

    expect(result).toHaveLength(2);

    const button = result.find((c) => c.name === "button");
    expect(button).toBeDefined();
    expect(button!.installed).toBe(true);

    const textbox = result.find((c) => c.name === "textbox");
    expect(textbox).toBeDefined();
    expect(textbox!.installed).toBe(false);
  });

  it("should work without config (shows all as not installed)", async () => {
    await fs.remove(path.join(tmpDir, "win7ui.config.json"));

    const { runList } = await import("../list.js");
    const result = await runList({
      cwd: tmpDir,
      registryPath: registryDir,
    });

    expect(result).toHaveLength(2);
    expect(result.every((c) => !c.installed)).toBe(true);
  });
});
