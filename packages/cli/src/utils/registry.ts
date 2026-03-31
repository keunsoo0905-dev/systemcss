import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ComponentMeta {
  name: string;
  displayName: string;
  description: string;
  dependencies: string[];
}

export interface RegistryIndex {
  registryVersion: string;
  minCliVersion: string;
  maxCliVersion: string;
  base: {
    css: string[];
  };
  components: ComponentMeta[];
}

export interface ComponentDetail {
  name: string;
  displayName: string;
  description: string;
  dependencies: string[];
  css: string[];
  files: {
    react: { ts: string[]; js: string[] };
    svelte: { ts: string[]; js: string[] };
    vue: { ts: string[]; js: string[] };
  };
}

function getRegistryPath(): string {
  // In development: ../../registry (relative to src/utils/)
  // In production (bundled): ../registry (relative to dist/)
  const devPath = path.resolve(__dirname, "../../../../registry");
  const prodPath = path.resolve(__dirname, "../registry");

  if (fs.existsSync(devPath)) {
    return devPath;
  }
  return prodPath;
}

export async function loadRegistryIndex(): Promise<RegistryIndex> {
  const registryPath = getRegistryPath();
  const indexPath = path.join(registryPath, "index.json");

  if (!(await fs.pathExists(indexPath))) {
    throw new Error(`Registry index not found at ${indexPath}`);
  }

  return fs.readJson(indexPath);
}

export async function loadComponentDetail(
  componentName: string
): Promise<ComponentDetail> {
  const registryPath = getRegistryPath();
  const componentPath = path.join(
    registryPath,
    "components",
    `${componentName}.json`
  );

  if (!(await fs.pathExists(componentPath))) {
    throw new Error(`Component "${componentName}" not found in registry`);
  }

  return fs.readJson(componentPath);
}

export function getRegistryFilePath(relativePath: string): string {
  const registryPath = getRegistryPath();
  return path.join(registryPath, relativePath);
}
