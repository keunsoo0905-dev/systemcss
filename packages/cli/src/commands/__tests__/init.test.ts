import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";

describe("init command", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "win7ui-test-init-"));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("should create win7ui.config.json with detected framework", async () => {
    // Setup: Create a package.json with react dependency
    await fs.writeJson(path.join(tmpDir, "package.json"), {
      dependencies: { react: "^18.0.0", "react-dom": "^18.0.0" },
    });

    const { runInit } = await import("../init.js");
    await runInit({
      cwd: tmpDir,
      framework: undefined,
      typescript: true,
      componentDir: undefined,
      cssDir: undefined,
      nonInteractive: true,
    });

    const configPath = path.join(tmpDir, "win7ui.config.json");
    expect(await fs.pathExists(configPath)).toBe(true);

    const config = await fs.readJson(configPath);
    expect(config.framework).toBe("react");
    expect(config.typescript).toBe(true);
    expect(config.componentDir).toBe("src/components/win7ui");
    expect(config.cssDir).toBe("src/components/win7ui/css");
  });

  it("should use explicitly provided framework over auto-detect", async () => {
    await fs.writeJson(path.join(tmpDir, "package.json"), {
      dependencies: { react: "^18.0.0" },
    });

    const { runInit } = await import("../init.js");
    await runInit({
      cwd: tmpDir,
      framework: "svelte",
      typescript: false,
      componentDir: undefined,
      cssDir: undefined,
      nonInteractive: true,
    });

    const config = await fs.readJson(path.join(tmpDir, "win7ui.config.json"));
    expect(config.framework).toBe("svelte");
    expect(config.typescript).toBe(false);
  });

  it("should use custom componentDir and cssDir", async () => {
    await fs.writeJson(path.join(tmpDir, "package.json"), {
      dependencies: { vue: "^3.0.0" },
    });

    const { runInit } = await import("../init.js");
    await runInit({
      cwd: tmpDir,
      framework: undefined,
      typescript: true,
      componentDir: "lib/ui",
      cssDir: "lib/ui/styles",
      nonInteractive: true,
    });

    const config = await fs.readJson(path.join(tmpDir, "win7ui.config.json"));
    expect(config.framework).toBe("vue");
    expect(config.componentDir).toBe("lib/ui");
    expect(config.cssDir).toBe("lib/ui/styles");
  });

  it("should fail gracefully when no framework detected and none provided", async () => {
    // No package.json at all
    const { runInit } = await import("../init.js");

    await expect(
      runInit({
        cwd: tmpDir,
        framework: undefined,
        typescript: true,
        componentDir: undefined,
        cssDir: undefined,
        nonInteractive: true,
      })
    ).rejects.toThrow("Could not detect framework");
  });
});
