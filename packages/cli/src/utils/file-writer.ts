import fs from "fs-extra";
import path from "path";
import type { Framework } from "./detect-framework.js";

export interface WriteConfig {
  framework: Framework;
  typescript: boolean;
  componentDir: string;
  cssDir: string;
}

export interface Win7uiConfig {
  framework: Framework;
  typescript: boolean;
  componentDir: string;
  cssDir: string;
}

const CONFIG_FILENAME = "win7ui.config.json";

export async function loadConfig(cwd: string): Promise<Win7uiConfig | null> {
  const configPath = path.join(cwd, CONFIG_FILENAME);
  if (!(await fs.pathExists(configPath))) {
    return null;
  }
  return fs.readJson(configPath);
}

export async function saveConfig(
  cwd: string,
  config: Win7uiConfig
): Promise<void> {
  const configPath = path.join(cwd, CONFIG_FILENAME);
  await fs.writeJson(configPath, config, { spaces: 2 });
}

export async function copyComponentFile(
  srcPath: string,
  destDir: string,
  destFilename: string
): Promise<void> {
  await fs.ensureDir(destDir);
  const destPath = path.join(destDir, destFilename);
  await fs.copy(srcPath, destPath);
}

export async function copyFile(
  srcPath: string,
  destPath: string
): Promise<void> {
  await fs.ensureDir(path.dirname(destPath));
  await fs.copy(srcPath, destPath);
}

export async function removeFile(filePath: string): Promise<boolean> {
  if (await fs.pathExists(filePath)) {
    await fs.remove(filePath);
    return true;
  }
  return false;
}

export async function updateBarrelFile(
  componentDir: string,
  installedComponents: string[],
  typescript: boolean
): Promise<void> {
  const ext = typescript ? "ts" : "js";
  const barrelPath = path.join(componentDir, `index.${ext}`);

  const lines = installedComponents
    .sort()
    .map((name) => {
      const pascalName = name.charAt(0).toUpperCase() + name.slice(1);
      const fileName = pascalName;
      return `export { ${pascalName} } from "./${fileName}";`;
    });

  const content = lines.join("\n") + "\n";
  await fs.writeFile(barrelPath, content, "utf-8");
}
